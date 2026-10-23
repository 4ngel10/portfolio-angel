"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

/** Alta de incidencia por parte del cliente: POST /api/incidencias (avisa al admin por correo). */
export function IncidenciaForm({
  proyectos,
  proyectoId,
}: {
  proyectos: { id: string; titulo: string }[];
  proyectoId?: string;
}) {
  const router = useRouter();
  const { t } = usePT();
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [hecho, setHecho] = useState(false);
  const sufijo = proyectoId ?? "x";

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    setError(null);
    setHecho(false);
    setEnviando(true);

    const res = await fetch("/api/incidencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        proyectoId: proyectoId ?? fd.get("proyectoId"),
        titulo: fd.get("titulo"),
        descripcion: fd.get("descripcion"),
        prioridad: fd.get("prioridad"),
      }),
    }).catch(() => null);
    setEnviando(false);

    if (!res?.ok) {
      const cuerpo = await res?.json().catch(() => null);
      setError(cuerpo?.error ?? t("form.sendFail"));
      return;
    }
    form.reset();
    setHecho(true);
    router.refresh();
  }

  if (proyectos.length === 0) {
    return <p className="text-sm text-muted">{t("form.noProjects")}</p>;
  }

  return (
    <form onSubmit={enviar} className="grid gap-4">
      {proyectoId ? null : (
        <div>
          <label htmlFor="inc-proyecto" className={labelCls}>
            {t("common.project")}
          </label>
          <select id="inc-proyecto" name="proyectoId" required defaultValue="" className={inputCls}>
            <option value="" disabled>
              {t("form.chooseProject")}
            </option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor={`inc-titulo-${sufijo}`} className={labelCls}>
          {t("form.whatHappens")}
        </label>
        <input
          id={`inc-titulo-${sufijo}`}
          name="titulo"
          required
          minLength={3}
          maxLength={120}
          placeholder={t("form.summaryPlaceholder")}
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor={`inc-desc-${sufijo}`} className={labelCls}>
          {t("form.details")}
        </label>
        <textarea
          id={`inc-desc-${sufijo}`}
          name="descripcion"
          required
          minLength={5}
          maxLength={4000}
          rows={4}
          placeholder={t("form.detailsPlaceholder")}
          className={inputCls}
        />
      </div>
      <div className="sm:max-w-[240px]">
        <label htmlFor={`inc-prio-${sufijo}`} className={labelCls}>
          {t("form.priority")}
        </label>
        <select id={`inc-prio-${sufijo}`} name="prioridad" defaultValue="media" className={inputCls}>
          <option value="baja">{t("form.low")}</option>
          <option value="media">{t("form.medium")}</option>
          <option value="alta">{t("form.high")}</option>
        </select>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={enviando} className="btn-primary disabled:opacity-60">
          {enviando ? t("form.sending") : t("form.submit")}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {error ? <span className="text-[var(--accent)]">{error}</span> : null}
          {hecho ? <span className="text-muted">{t("form.sent")}</span> : null}
        </p>
      </div>
    </form>
  );
}
