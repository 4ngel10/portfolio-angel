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

type Resultado ={ nombre: string; error?: string };

/**
 * Sube archivos directamente del navegador a Supabase Storage con una URL firmada.
 * El archivo nunca pasa por Vercel: solo viajan los metadatos (presign y confirm).
 */
export function FileUploader({ proyectoId }: { proyectoId: string }) {
  const router = useRouter();
  const { t } = usePT();
  const input = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState<string | null>(null);
  const [resultados, setResultados] = useState<Resultado[]>([]);

  async function subir(file: File): Promise<Resultado> {
    if (file.size > MAX_BYTES) return { nombre: file.name, error: t("upload.tooBig") };
    // Windows no suele conocer el tipo de HEIC ni de MOV y deja file.type vacío.
    const contentType = file.type || TIPOS_POR_EXTENSION[file.name.split(".").pop()?.toLowerCase() ?? ""] || "application/octet-stream";

    const pre = await fetch("/api/storage/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, contentType, size: file.size, proyectoId }),
    }).catch(() => null);
    const firma = await pre?.json().catch(() => null);
    if (!pre?.ok || !firma?.token) return { nombre: file.name, error: firma?.error ?? t("upload.prepFail") };

    const { error } = await createClient().storage.from("archivos").uploadToSignedUrl(firma.path, firma.token, file, { contentType });
    if (error) return { nombre: file.name, error: t("upload.uploadFail") };

    const conf = await fetch("/api/storage/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: firma.path, fileName: file.name, contentType, proyectoId }),
    }).catch(() => null);
    if (!conf?.ok) return { nombre: file.name, error: t("upload.registerFail") };
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
      <input ref={input} id={`subida-${proyectoId}`} type="file" multiple onChange={alElegir} disabled={!!subiendo} className="sr-only" />
      <label
        htmlFor={`subida-${proyectoId}`}
        className={`btn-secondary cursor-pointer focus-within:outline-2 ${subiendo ? "pointer-events-none opacity-60" : ""}`}
      >
        {subiendo ? t("upload.uploading") : t("upload.button")}
      </label>
      <p className="mt-2 text-xs text-muted">{t("upload.hint")}</p>

      <div role="status" aria-live="polite" className="mt-2 text-sm">
        {subiendo ? <p className="text-muted">{t("upload.uploadingName", { name: subiendo })}</p> : null}
        {resultados.map((r, i) => (
          <p key={i} className={r.error ? "text-[var(--accent)]" : "text-muted"}>
            {r.error ? `${r.nombre}: ${r.error}` : t("upload.uploaded", { name: r.nombre })}
          </p>
        ))}
      </div>
    </div>
  );
}
