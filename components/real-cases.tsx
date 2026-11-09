"use client";

import { useI18n } from "@/lib/i18n";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

const CASES = [1, 2];

/**
 * Pega cada " · " al elemento anterior con un espacio duro, para que el salto de línea caiga
 * después del punto y nunca lo deje al principio de la línea siguiente.
 */
function glueDots(text: string) {
  return text.split(" · ").join(" · ");
}

/**
 * Casos reales (textos en about.case{n}*). Se usa en Sobre mí (H3) y en /servicios/sistemas
 * (H2). Sin nombres ni relación con el grupo hotelero. Una línea vertical en el acento, a modo
 * de cita, y nada más de color. `level` es el nivel del título de la sección; el de cada
 * caso baja un nivel.
 */
export function RealCases({ title, level }: { title: string; level: 2 | 3 }) {
  const { t } = useI18n();
  const Heading = level === 2 ? "h2" : "h3";
  const CaseHeading = level === 2 ? "h3" : "h4";
  return (
    <>
      <Reveal>
        <Heading
          className={
            level === 2
              ? "text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]"
              : "text-xl font-semibold tracking-tight"
          }
        >
          {title}
        </Heading>
      </Reveal>
      <RevealGroup
        className={`grid gap-10 md:grid-cols-2 md:gap-14 ${level === 2 ? "mt-10" : "mt-6"}`}
        stagger={0.08}
      >
        {CASES.map((n) => (
          <RevealItem key={n} as="div">
            <div className="border-l-2 pl-5" style={{ borderColor: "var(--accent)" }}>
              <CaseHeading className="text-lg font-semibold tracking-tight">
                {t(`about.case${n}Title`)}
              </CaseHeading>
              <p className="text-muted mt-2 max-w-[52ch] text-[15px] leading-relaxed text-pretty">
                {t(`about.case${n}Text`)}
              </p>
              <p className="text-muted mt-4 max-w-[52ch] font-mono text-xs leading-relaxed text-pretty">
                {glueDots(t(`about.case${n}Result`))}
              </p>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </>
  );
}
