"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { crearClave, revocarClave } from "@/lib/blog-claves-actions";
import { inputCls, labelCls } from "./styles";
import { usePT } from "./i18n-provider";

export type ClaveFila = {
  id: string;
  nombre: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

/** Alta, lista y revocación de las claves de la API del blog. La clave nueva se enseña una sola vez. */
export function BlogClaves({ claves }: { claves: ClaveFila[] }) {
  const { t, locale } = usePT();
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [nombre, setNombre] = useState("");
  const [nueva, setNueva] = useState<{ clave: string; nombre: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiada, setCopiada] = useState(false);

  const fecha = (iso: string) =>
    new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    });

  const alCrear = (e: React.FormEvent) => {
    e.preventDefault();
    empezar(async () => {
      setError(null);
      const r = await crearClave(nombre);
      if (!r.ok || !r.clave) return setError(r.error ?? t("blog.keys.errSave"));
      setNueva({ clave: r.clave, nombre: r.nombre ?? nombre });
      setNombre("");
      setCopiada(false);
      router.refresh();
    });
  };

  const alRevocar = (c: ClaveFila) => {
    if (!window.confirm(t("blog.keys.revokeConfirm", { nombre: c.nombre }))) return;
    empezar(async () => {
      const r = await revocarClave(c.id);
      if (!r.ok) return setError(r.error ?? t("blog.keys.errSave"));
      router.refresh();
    });
  };

  async function copiar() {
    if (!nueva) return;
    try {
      await navigator.clipboard.writeText(nueva.clave);
      setCopiada(true);
    } catch {
      /* sin portapapeles: la clave sigue visible para copiarla a mano */
    }
  }

  const activas = claves.filter((c) => !c.revoked_at);
  const revocadas = claves.filter((c) => c.revoked_at);

  return (
    <div className="space-y-6">
      {nueva ? (
        <section
          className="bg-paper-alt rounded-2xl border border-[var(--accent)] p-5 md:p-6"
          role="alert"
        >
          <h2 className="text-lg font-semibold tracking-tight">
            {t("blog.keys.newTitle", { nombre: nueva.nombre })}
          </h2>
          <p className="mt-2 text-sm font-medium text-[var(--warn)]">{t("blog.keys.onlyOnce")}</p>
          <p className="mt-3 font-mono text-[13px] break-all select-all">{nueva.clave}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-primary !px-3 !py-1.5 !text-sm" onClick={copiar}>
              {copiada ? t("blog.editor.copied") : t("blog.keys.copy")}
            </button>
            <button
              type="button"
              className="btn-secondary !px-3 !py-1.5 !text-sm"
              onClick={() => setNueva(null)}
            >
              {t("blog.keys.saved")}
            </button>
          </div>
        </section>
      ) : null}

      <section className="border-rule bg-paper-alt rounded-2xl border p-5 md:p-6">
        <h2 className="mb-1 text-lg font-semibold tracking-tight">{t("blog.keys.createTitle")}</h2>
        <p className="text-muted mb-4 max-w-[60ch] text-sm">{t("blog.keys.createHelp")}</p>
        <form onSubmit={alCrear} className="flex flex-wrap items-end gap-3">
          <div className="min-w-[14rem] flex-1">
            <label htmlFor="clave-nombre" className={labelCls}>
              {t("blog.keys.name")}
            </label>
            <input
              id="clave-nombre"
              className={inputCls}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={60}
              required
            />
          </div>
          <button type="submit" className="btn-primary disabled:opacity-60" disabled={pendiente}>
            {t("blog.keys.create")}
          </button>
        </form>
        <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm text-[var(--danger)]">
          {error}
        </p>
      </section>

      <section className="border-rule bg-paper-alt rounded-2xl border p-5 md:p-6">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">{t("blog.keys.listTitle")}</h2>
        {activas.length === 0 ? (
          <p className="text-muted text-sm">{t("blog.keys.empty")}</p>
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {activas.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block font-medium">{c.nombre}</span>
                  <span className="text-muted block text-xs">
                    {t("blog.keys.created", { fecha: fecha(c.created_at) })} ·{" "}
                    {c.last_used_at
                      ? t("blog.keys.lastUsed", { fecha: fecha(c.last_used_at) })
                      : t("blog.keys.neverUsed")}
                  </span>
                </span>
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-1.5 !text-sm disabled:opacity-60"
                  disabled={pendiente}
                  onClick={() => alRevocar(c)}
                >
                  {t("blog.keys.revoke")}
                </button>
              </li>
            ))}
          </ul>
        )}
        {revocadas.length > 0 ? (
          <details className="mt-4">
            <summary className="text-muted cursor-pointer text-sm">
              {t("blog.keys.revokedTitle", { n: revocadas.length })}
            </summary>
            <ul className="mt-2 space-y-1 text-sm">
              {revocadas.map((c) => (
                <li key={c.id} className="text-muted">
                  {c.nombre} · {t("blog.keys.revokedOn", { fecha: fecha(c.revoked_at as string) })}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </section>
    </div>
  );
}
