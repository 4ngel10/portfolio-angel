"use client";

import { useState } from "react";
import { Portfolio } from "@/components/portfolio";
import { ProjectArticle } from "@/components/project-article";
import { type Locale } from "@/lib/i18n";
import { FixedLocale } from "@/lib/i18n-fijo";
import {
  proyectoArticulo,
  proyectoCard,
  proyectoTieneIngles,
  type Proyecto,
} from "@/lib/proyectos-types";
import { usePT } from "./i18n-provider";

/**
 * Vista previa de un proyecto con los componentes reales de la web, en español o en inglés, y
 * debajo la card tal como sale en la home. Sirve también para borradores y programados.
 */
export function PortfolioVista({ proyecto }: { proyecto: Proyecto }) {
  const { t } = usePT();
  const [idioma, setIdioma] = useState<Locale>("es");
  const sinIngles = idioma === "en" && !proyectoTieneIngles(proyecto);

  return (
    <>
      <div className="border-rule bg-paper-alt mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm">
        <span className="text-muted">{t("portfolio.preview.banner")}</span>
        <div role="group" aria-label={t("portfolio.preview.lang")} className="flex gap-1">
          {(["es", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={idioma === l}
              onClick={() => setIdioma(l)}
              className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${idioma === l ? "border-[var(--accent)] text-[var(--accent)]" : "border-rule text-muted hover:text-ink"}`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {sinIngles ? (
        <p className="border-rule text-muted rounded-xl border px-4 py-3 text-sm">
          {t("portfolio.preview.noEnglish", { slug: proyecto.slug })}
        </p>
      ) : (
        <FixedLocale locale={idioma}>
          <div className="border-rule -mx-2 overflow-hidden rounded-2xl border">
            <ProjectArticle project={proyectoArticulo(proyecto, idioma)} next={null} comoDiv />
          </div>

          <h2 className="mt-10 mb-2 text-lg font-semibold tracking-tight">{t("portfolio.preview.cardTitle")}</h2>
          <p className="text-muted mb-2 text-sm">{t("portfolio.preview.cardHelp")}</p>
          <div className="border-rule -mx-2 overflow-hidden rounded-2xl border">
            <Portfolio projects={[proyectoCard(proyecto, idioma)]} />
          </div>
        </FixedLocale>
      )}
    </>
  );
}
