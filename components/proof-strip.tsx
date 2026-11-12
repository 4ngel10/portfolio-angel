"use client";

import { useI18n } from "@/lib/i18n";
import { CERTIFICATIONS } from "@/lib/certifications";

// Cifras del equipo de sistemas en el que trabaja Ángel (las dio él el 2026-11-08). Textos en
// hero.stat{n}Value / Label. Van estáticas, sin contador: el hero no debe depender del JS.
const STATS = [1, 2, 3, 4];

// Certificaciones: lib/certifications.ts (la misma lista alimenta el JSON-LD).
const CERTS = CERTIFICATIONS.map((c) => c.name);

/** Prueba social bajo los botones del hero: cifras del equipo y certificaciones. */
export function ProofStrip() {
  const { t } = useI18n();
  return (
    <div className="border-rule mt-9 border-t pt-6 md:mt-10">
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
        {STATS.map((n) => (
          // dt (etiqueta) antes que dd (cifra) en el HTML; flex-col-reverse pinta la cifra arriba.
          <div key={n} className="flex flex-col-reverse">
            <dt className="text-muted mt-1.5 text-[13px]">{t(`hero.stat${n}Label`)}</dt>
            <dd className="text-[28px] leading-none font-semibold tracking-[-0.035em] md:text-3xl">
              {t(`hero.stat${n}Value`)}
            </dd>
          </div>
        ))}
      </dl>
      <p className="text-muted mt-3 text-[13px]">{t("hero.statsNote")}</p>
      <ul
        aria-label={t("hero.certsLabel")}
        className="text-muted mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs"
      >
        {CERTS.map((c) => (
          <li key={c} className="flex items-center gap-2">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent shrink-0"
              aria-hidden
            >
              <path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}
