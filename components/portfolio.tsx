"use client";

import { TiltCard } from "./tilt-card";
import { useI18n } from "@/lib/i18n";

export function Portfolio() {
  const { t } = useI18n();

  const projects = [
    {
      key: "p1",
      cover: "WEB",
      coverBg: "#efece4",
      tag: t("portfolio.p1Tag"),
      title: t("portfolio.p1Title"),
      desc: t("portfolio.p1Desc"),
      tech: ["HTML", "CSS", "JavaScript", "Vercel"],
    },
    {
      key: "p2",
      cover: "PS1",
      coverBg: "#e8e2d2",
      tag: t("portfolio.p2Tag"),
      title: t("portfolio.p2Title"),
      desc: t("portfolio.p2Desc"),
      tech: ["PowerShell", "Active Directory", "Windows Server"],
    },
    {
      key: "p3",
      cover: "LAB",
      coverBg: "#f0e9d9",
      tag: t("portfolio.p3Tag"),
      title: t("portfolio.p3Title"),
      desc: t("portfolio.p3Desc"),
      tech: ["Proxmox", "Docker", "Home Assistant"],
    },
  ];

  return (
    <section id="portfolio" className="py-24 md:py-28 bg-paper-alt">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-tight tracking-[-0.025em]">
          {t("portfolio.title")}
        </h2>
        <p className="text-[17px] text-muted leading-relaxed max-w-xl mt-5 mb-14">
          {t("portfolio.lead")}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5" style={{ perspective: "1200px" }}>
          {projects.map((p) => (
            <TiltCard
              key={p.key}
              className="rounded-2xl border overflow-hidden transition-shadow hover:shadow-[0_30px_60px_-25px_rgba(15,23,42,0.18)]"
              style={{ borderColor: "var(--rule)", background: "var(--bg)" }}
            >
              <div
                className="h-52 flex items-center justify-center relative overflow-hidden"
                style={{ background: p.coverBg }}
              >
                <div
                  className="absolute inset-0 opacity-50"
                  style={{
                    backgroundImage: "radial-gradient(rgba(0,0,0,0.08) 1px, transparent 1px)",
                    backgroundSize: "14px 14px",
                  }}
                />
                <span className="font-mono text-5xl font-medium tracking-tight relative z-10" style={{ color: "#1a1a1a" }}>
                  {p.cover}
                </span>
              </div>
              <div className="p-6" style={{ transform: "translateZ(20px)" }}>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-wider mb-2 inline-block" style={{ color: "var(--accent)" }}>
                  {p.tag}
                </span>
                <h3 className="text-[17px] font-semibold tracking-tight mb-2 leading-snug">{p.title}</h3>
                <p className="text-[13px] text-muted leading-relaxed mb-4">{p.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {p.tech.map((tt) => (
                    <span
                      key={tt}
                      className="font-mono text-[11px] px-2 py-0.5 rounded"
                      style={{ background: "var(--chip)", color: "var(--muted)" }}
                    >
                      {tt}
                    </span>
                  ))}
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  );
}
