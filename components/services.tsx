"use client";

import Link from "next/link";
import { TiltCard } from "./tilt-card";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { SERVICE_ICONS } from "./service-icons";
import { useI18n } from "@/lib/i18n";
import { SERVICES } from "@/lib/services";

export function Services() {
  const { t } = useI18n();

  const services = SERVICES.map((s) => ({
    key: s.key,
    id: s.id,
    icon: SERVICE_ICONS[s.key],
    title: t(`services.${s.key}Title`),
    lead: t(`services.${s.key}Lead`),
    bullets: [1, 2, 3, 4].map((n) => t(`services.${s.key}b${n}`)),
  }));

  return (
    <section id="services" className="py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <Reveal>
          <h2 className="max-w-3xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("services.title")}
          </h2>
          <p className="text-muted mt-5 mb-14 max-w-xl text-[17px] leading-relaxed">
            {t("services.lead")}
          </p>
        </Reveal>

        <RevealGroup
          className="grid gap-5 md:grid-cols-2"
          stagger={0.08}
          style={{ perspective: "1200px" }}
        >
          {services.map((s, idx) => (
            <RevealItem key={s.key} className="h-full">
              {/* Cada card abre su apartado en la página de servicios (app/servicios). */}
              <Link
                href={`/servicios/${s.id}`}
                className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                <TiltCard
                  className="group border-rule relative flex h-full flex-col rounded-2xl border p-8 transition-[box-shadow,border-color] duration-300 hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)] md:p-10"
                  style={{ background: "var(--bg)" }}
                >
                  <span
                    className="absolute top-7 right-8 font-mono text-5xl font-medium tracking-tight opacity-[0.08] transition-opacity duration-300 group-hover:opacity-25 md:text-6xl"
                    style={{ color: "var(--accent)" }}
                    aria-hidden
                  >
                    0{idx + 1}
                  </span>
                  <div
                    className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] text-[var(--accent)] transition-[background-color,color] duration-300 group-hover:bg-[var(--accent)] group-hover:text-white"
                    style={{ transform: "translateZ(30px)" }}
                  >
                    <span className="transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                      {s.icon}
                    </span>
                  </div>
                  <h3
                    className="mb-3 text-xl font-semibold tracking-tight md:text-[22px]"
                    style={{ transform: "translateZ(30px)" }}
                  >
                    {/* Mismo hover que los títulos de proyectos. El scale va en un span porque
                        el h3 ya usa transform para el translateZ del tilt. */}
                    <span className="inline-block origin-left transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06] group-hover:font-bold">
                      {s.title}
                    </span>
                  </h3>
                  <p className="text-muted mb-5 text-sm leading-relaxed">{s.lead}</p>
                  <ul className="space-y-2.5">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex gap-2.5 text-sm leading-snug">
                        <svg
                          className="mt-0.5 shrink-0"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ color: "var(--accent)" }}
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {b}
                      </li>
                    ))}
                  </ul>
                  <span className="text-muted mt-auto inline-flex items-center gap-2 self-start pt-7 text-[13px] font-medium transition-colors duration-200 group-hover:text-[var(--accent)]">
                    {t("servicesPage.more")}
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform duration-200 group-hover:translate-x-1"
                      aria-hidden
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                </TiltCard>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
