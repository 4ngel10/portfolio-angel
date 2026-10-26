"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePT } from "./i18n-provider";

const MAX_BYTES = 50 * 1024 * 1024;

const TIPOS_POR_EXTENSION: Record<string, string> = {
  heic: "image/heic",
  heif: "image/heif",
  tif: "image/tiff",
  tiff: "image/tiff",
  mov: "video/quicktime",
  webm: "video/webm",
};

type Resultado = { nombre: string; error?: string };

type Firma = { path: string; token: string };

/** Dónde y cómo se sube: lo que cambia entre archivos de proyecto y justificantes. */
export type DestinoSubida = {
  /** Identifica el campo de archivo (tiene que ser único en la página). */
  id: string;
  bucket: string;
  /** Ruta que prepara la URL firmada (paso 1). */
  presign: string;
  /** Campos extra del cuerpo del paso 1 (el archivo y su tamaño van siempre). */
  cuerpo: Record<string, string>;
  /** Paso 2: registrar el archivo ya subido. Devuelve true si salió bien. */
  confirmar: (archivo: { path: string; fileName: string; contentType: string }) => Promise<boolean>;
  maxBytes?: number;
  multiple?: boolean;
  accept?: string;
  /** Claves de `portal.*` para el botón y la ayuda; por defecto las de archivos de proyecto. */
  claves?: { button: string; hint: string; tooBig: string };
  /** Para filas de tabla: botón pequeño y sin texto de ayuda. */
  compacto?: boolean;
};

/**
 * Sube archivos directamente del navegador a Supabase Storage con una URL firmada.
 * El archivo nunca pasa por Vercel: solo viajan los metadatos (presign y confirm).
 */
export function SubidaArchivos({ destino }: { destino: DestinoSubida }) {
  const router = useRouter();
  const { t } = usePT();
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const claves = destino.claves ?? {
    button: "upload.button",
    hint: "upload.hint",
    tooBig: "upload.tooBig",
  };

  async function subir(file: File): Promise<Resultado> {
    if (file.size > (destino.maxBytes ?? MAX_BYTES)) {
      return { nombre: file.name, error: t(claves.tooBig) };
    }
    // Windows no suele conocer el tipo de HEIC ni de MOV y deja file.type vacío.
    const contentType =
      file.type ||
      TIPOS_POR_EXTENSION[file.name.split(".").pop()?.toLowerCase() ?? ""] ||
      "application/octet-stream";

    const pre = await fetch(destino.presign, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: file.name,
        contentType,
        size: file.size,
        ...destino.cuerpo,
      }),
    }).catch(() => null);
    const firma = (await pre?.json().catch(() => null)) as (Firma & { error?: string }) | null;
    if (!pre?.ok || !firma?.token)
      return { nombre: file.name, error: firma?.error ?? t("upload.prepFail") };

    const { error } = await createClient()
      .storage.from(destino.bucket)
      .uploadToSignedUrl(firma.path, firma.token, file, { contentType });
    if (error) return { nombre: file.name, error: t("upload.uploadFail") };

    const registrado = await destino
      .confirmar({ path: firma.path, fileName: file.name, contentType })
      .catch(() => false);
    if (!registrado) return { nombre: file.name, error: t("upload.registerFail") };
    return { nombre: file.name };
  }

  async function alElegir(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setResultados([]);
    const out: Resultado[] = [];
    for (const f of files) {
      setSubiendo(f.name);
      out.push(await subir(f));
    }
    setSubiendo(null);
    setResultados(out);
    if (input.current) input.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <input
        ref={input}
        id={destino.id}
        type="file"
        multiple={destino.multiple ?? true}
        accept={destino.accept}
        onChange={alElegir}
        disabled={!!subiendo}
        className="sr-only"
      />
      <label
        htmlFor={destino.id}
        className={`btn-secondary cursor-pointer focus-within:outline-2 ${destino.compacto ? "!px-3 !py-1.5 !text-sm" : ""} ${subiendo ? "pointer-events-none opacity-60" : ""}`}
      >
        {subiendo ? t("upload.uploading") : t(claves.button)}
      </label>
      {destino.compacto ? null : <p className="text-muted mt-2 text-xs">{t(claves.hint)}</p>}

      <div role="status" aria-live="polite" className="mt-2 text-sm">
        {subiendo ? (
          <p className="text-muted">{t("upload.uploadingName", { name: subiendo })}</p>
        ) : null}
        {resultados.map((r, i) => (
          <p key={i} className={r.error ? "text-[var(--accent)]" : "text-muted"}>
            {r.error ? `${r.nombre}: ${r.error}` : t("upload.uploaded", { name: r.nombre })}
          </p>
        ))}
      </div>
    </div>
  );
}

/** Archivos de un proyecto (zona de admin y de clientes). */
export function FileUploader({ proyectoId }: { proyectoId: string }) {
  return (
    <SubidaArchivos
      destino={{
        id: `subida-${proyectoId}`,
        bucket: "archivos",
        presign: "/api/storage/presign",
        cuerpo: { proyectoId },
        confirmar: async ({ path, fileName, contentType }) => {
          const conf = await fetch("/api/storage/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, fileName, contentType, proyectoId }),
          });
          return conf.ok;
        },
      }}
    />
  );
}
