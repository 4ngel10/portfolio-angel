"use client";

import { useState } from "react";
import { confirmarJustificante, urlJustificante } from "@/lib/portal/finanzas-actions";
import { usePT } from "./i18n-provider";
import { SubidaArchivos } from "./file-uploader";

const MAX_BYTES = 10 * 1024 * 1024;

/** Subir (o cambiar) el justificante de un gasto: va directo del navegador al bucket "finanzas". */
export function SubirJustificante({ gastoId, tiene }: { gastoId: string; tiene: boolean }) {
  return (
    <SubidaArchivos
      destino={{
        id: `justificante-${gastoId}`,
        bucket: "finanzas",
        presign: "/api/finanzas/justificante",
        cuerpo: { gastoId },
        confirmar: async ({ path }) => (await confirmarJustificante(gastoId, path)).ok,
        maxBytes: MAX_BYTES,
        compacto: true,
        multiple: false,
        accept: "application/pdf,image/jpeg,image/png,image/webp",
        claves: {
          button: tiene ? "finance.receipt.replace" : "finance.receipt.attach",
          hint: "finance.receipt.hint",
          tooBig: "finance.receipt.tooBig",
        },
      }}
    />
  );
}

/** Abre el justificante con un enlace de 60 segundos que se pide al pulsar. */
export function VerJustificante({ gastoId }: { gastoId: string }) {
  const { t } = usePT();
  const [error, setError] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState(false);

  async function abrir() {
    setError(null);
    setAbriendo(true);
    // La pestaña se abre ya, dentro del clic, para que el navegador no la bloquee.
    const pestana = window.open("", "_blank");
    if (pestana) pestana.opener = null;
    const r: { url?: string; error?: string } = await urlJustificante(gastoId).catch(() => ({
      error: t("err.receiptFail"),
    }));
    setAbriendo(false);
    if (r.url && pestana) pestana.location.href = r.url;
    else {
      pestana?.close();
      setError(r.error ?? t("err.receiptFail"));
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={abrir}
        disabled={abriendo}
        className="hover:text-accent inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline disabled:opacity-60"
      >
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
        {abriendo ? t("finance.receipt.opening") : t("finance.receipt.view")}
      </button>
      {error ? (
        <p role="status" className="mt-1 text-xs text-[var(--accent)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
