"use client";

import { TiltCard } from "./tilt-card";
import { useI18n } from "@/lib/i18n";

export function Services() {
  const { t } = useI18n();

  const services = [
    {
      key: "s1",
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-tight tracking-[-0.025em] max-w-3xl">
          {t("services.title")}
        </h2>
        <p className="text-[17px] text-muted leading-relaxed max-w-xl mt-5 mb-14">
          {t("services.lead")}
        </p>

        <div className="grid md:grid-cols-2 gap-5" style={{ perspective: "1200px" }}>
          {services.map((s) => (
            <TiltCard
              key={s.key}
              className="rounded-2xl border p-8 md:p-10 transition-shadow hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.22)]"
              style={{ borderColor: "var(--rule)", background: "var(--bg)" }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                style={{
                  background: "color-mix(in oklab, var(--accent) 10%, transparent)",
                  color: "var(--accent)",
                  transform: "translateZ(30px)",
                }}
              >
                {s.icon}
              </div>
              <h3 className="text-xl md:text-[22px] font-semibold tracking-tight mb-3" style={{ transform: "translateZ(30px)" }}>
                {s.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-5">{s.lead}</p>
              <ul className="space-y-2.5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-2.5 text-sm leading-snug">
                    <svg
                      className="shrink-0 mt-0.5"
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
          ))}
        </div>
      </div>
    </section>
  );
}
