"use client";

import { TiltCard } from "./tilt-card";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { useI18n } from "@/lib/i18n";

export function Services() {
  const { t } = useI18n();

  const services = [
    {
      key: "s1",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      title: t("services.s1Title"),
      lead: t("services.s1Lead"),
      bullets: [t("services.s1b1"), t("services.s1b2"), t("services.s1b3"), t("services.s1b4")],
    },
    {
      key: "s2",
      icon: (
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      title: t("services.s2Title"),
      lead: t("services.s2Lead"),
      bullets: [t("services.s2b1"), t("services.s2b2"), t("services.s2b3"), t("services.s2b4")],
    },
  ];

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
              <TiltCard
                className="group border-rule relative h-full rounded-2xl border p-8 transition-[box-shadow,border-color] duration-300 hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)] md:p-10"
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
                  {s.title}
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
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
