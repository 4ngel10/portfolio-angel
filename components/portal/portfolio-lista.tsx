"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { moverProyecto } from "@/lib/proyectos-actions";
import { usePT } from "./i18n-provider";

export type FilaLista = {
  id: string;
  slug: string;
  titulo: string;
  tag: string;
  servicio: string;
  /** Dónde sale además de su página, por ejemplo "Servicios web". Vacío si en ninguna. */
  enServicios: string;
  estado: "borrador" | "programado" | "publicado";
  estadoTexto: string;
  fecha: string;
  image: string | null;
  cover: string;
  errores: number;
  provisional: boolean;
  ejemplo: boolean;
  sinIngles: boolean;
  sinOg: boolean;
};

const chip =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap";
const COLUMNAS =
  "lg:grid-cols-[4.75rem_5rem_minmax(0,1fr)_9rem_7rem_7rem_minmax(0,13rem)]";

/** Lista de proyectos con las flechas de orden. La función de Postgres mueve los dos vecinos a la vez. */
export function PortfolioLista({ filas }: { filas: FilaLista[] }) {
  const { t } = usePT();
  const router = useRouter();
  const [pendiente, empezar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [moviendo, setMoviendo] = useState<string | null>(null);

  function mover(id: string, direccion: "arriba" | "abajo") {
    setError(null);
    setMoviendo(id);
    empezar(async () => {
      const r = await moverProyecto(id, direccion);
      setMoviendo(null);
      if (!r.ok) return setError(r.error ?? t("portfolio.err.moveFailed"));
      router.refresh();
    });
  }

  return (
    <>
      {/* Un solo aviso para toda la lista, con el texto exacto del problema. */}
      <div role="alert" className="mb-3 min-h-0">
        {error ? (
          <p className="rounded-xl border border-[var(--danger)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </p>
        ) : null}
      </div>
      <div
        className={`text-muted hidden grid-cols-1 gap-4 border-b border-[var(--rule)] pb-2 text-xs font-medium lg:grid ${COLUMNAS}`}
        aria-hidden
      >
        <span>{t("portfolio.colOrder")}</span>
        <span>{t("portfolio.colCover")}</span>
        <span>{t("portfolio.colTitle")}</span>
        <span>{t("portfolio.colTag")}</span>
        <span>{t("portfolio.colStatus")}</span>
        <span>{t("portfolio.colDate")}</span>
        <span>{t("portfolio.colChecks")}</span>
      </div>
      <ul className="divide-y divide-[var(--rule)]">
        {filas.map((f, i) => (
          <li
            key={f.id}
            className={`grid items-center gap-x-4 gap-y-2 py-3 ${COLUMNAS} grid-cols-[auto_minmax(0,1fr)]`}
          >
            <span className="flex items-center gap-1" role="group" aria-label={t("portfolio.colOrder")}>
              {(["arriba", "abajo"] as const).map((dir) => {
                const extremo = dir === "arriba" ? i === 0 : i === filas.length - 1;
                return (
                  <button
                    key={dir}
                    type="button"
                    disabled={pendiente || extremo}
                    onClick={() => mover(f.id, dir)}
                    aria-label={t(dir === "arriba" ? "portfolio.moveUp" : "portfolio.moveDown", {
                      title: f.titulo,
                    })}
                    aria-busy={moviendo === f.id}
                    className="border-rule inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-[var(--accent)] active:scale-[0.97] disabled:opacity-35 disabled:hover:border-[var(--rule)] disabled:hover:text-inherit"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polyline points={dir === "arriba" ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                    </svg>
                  </button>
                );
              })}
            </span>

            <Link
              href={`/admin/portfolio/${f.id}`}
              className="group col-start-2 row-start-1 grid min-w-0 items-center gap-x-4 gap-y-2 rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent)] lg:contents"
            >
              <span className="border-rule bg-paper-alt relative hidden h-12 w-20 overflow-hidden rounded-lg border lg:block">
                {f.image ? (
                  // eslint-disable-next-line @next/next/no-img-element -- miniatura del admin, mismo origen
                  <img src={f.image} alt="" width={80} height={48} className="size-full object-cover object-top" />
                ) : (
                  <span
                    aria-hidden
                    className="text-muted absolute inset-0 flex items-center justify-center font-mono text-xs"
                  >
                    {f.cover}
                  </span>
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium group-hover:text-[var(--accent)]">
                  {f.titulo || t("portfolio.untitled")}
                </span>
                <span className="text-muted block truncate font-mono text-xs">{f.slug}</span>
              </span>
              <span className="text-muted text-sm">
                <span className="block">{f.tag}</span>
                <span className="block text-xs">
                  {f.servicio}
                  {f.enServicios ? ` · ${f.enServicios}` : ""}
                </span>
              </span>
              <span>
                <span
                  className={`${chip} ${f.estado === "publicado" ? "border-[var(--positive)] text-[var(--positive)]" : f.estado === "programado" ? "border-[var(--accent)] text-[var(--accent)]" : "border-rule text-muted"}`}
                >
                  {f.estadoTexto}
                </span>
              </span>
              <span className="text-muted text-sm">{f.fecha || "-"}</span>
              <span className="flex flex-wrap gap-1.5">
                {f.errores > 0 ? (
                  <span className={`${chip} border-[var(--danger)] text-[var(--danger)]`}>
                    {t("portfolio.chipErrors", { n: f.errores })}
                  </span>
                ) : null}
                {f.provisional ? (
                  <span className={`${chip} border-[var(--warn)] text-[var(--warn)]`}>
                    {t("portfolio.chipProvisional")}
                  </span>
                ) : null}
                {f.ejemplo ? (
                  <span className={`${chip} border-rule text-muted`}>{t("portfolio.chipExample")}</span>
                ) : null}
                {f.sinIngles ? (
                  <span className={`${chip} border-rule text-muted`}>{t("portfolio.chipNoEnglish")}</span>
                ) : null}
                {f.sinOg ? (
                  <span className={`${chip} border-rule text-muted`}>{t("portfolio.chipNoOg")}</span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
