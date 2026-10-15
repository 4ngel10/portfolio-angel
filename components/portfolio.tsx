"use client";

import { TiltCard } from "./tilt-card";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { useI18n } from "@/lib/i18n";

export function Portfolio() {
  const { t } = useI18n();

  // La portada mezcla el acento con el fondo alternativo, así funciona en claro y oscuro.
  const projects = [
    {
      key: "p1",
      cover: "WEB",
      tint: 8,
      tag: t("portfolio.p1Tag"),
      title: t("portfolio.p1Title"),
      desc: t("portfolio.p1Desc"),
      tech: ["HTML", "CSS", "JavaScript", "Vercel"],
    },
    {
      key: "p2",
      cover: "PS1",
      tint: 14,
      tag: t("portfolio.p2Tag"),
      title: t("portfolio.p2Title"),
      desc: t("portfolio.p2Desc"),
      tech: ["PowerShell", "Active Directory", "Windows Server"],
    },
    {
      key: "p3",
      cover: "LAB",
      tint: 20,
      tag: t("portfolio.p3Tag"),
      title: t("portfolio.p3Title"),
      desc: t("portfolio.p3Desc"),
      tech: ["Proxmox", "Docker", "Home Assistant"],
    },
  ];

  return (
    <section id="portfolio" className="bg-paper-alt py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <Reveal>
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("portfolio.title")}
          </h2>
          <p className="text-muted mt-5 mb-14 max-w-xl text-[17px] leading-relaxed">
            {t("portfolio.lead")}
          </p>
        </Reveal>

        <RevealGroup
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.12}
          style={{ perspective: "1200px" }}
        >
          {projects.map((p, idx) => (
            <RevealItem key={p.key} className="h-full">
              <TiltCard
                className="group border-rule h-full overflow-hidden rounded-2xl border transition-[box-shadow,border-color] duration-300 hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)]"
                style={{ background: "var(--bg)" }}
              >
                <div
                  className="relative h-52 overflow-hidden"
                  style={{
                    background: `color-mix(in oklab, var(--accent) ${p.tint}%, var(--bg-alt))`,
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110">
                    <div
                      className="absolute inset-[-20%] opacity-60 transition-transform duration-700 group-hover:-translate-y-3 group-hover:translate-x-3"
                      style={{
                        backgroundImage:
                          "radial-gradient(color-mix(in oklab, var(--fg) 14%, transparent) 1px, transparent 1px)",
                        backgroundSize: "14px 14px",
                      }}
                    />
                    <span className="relative z-10 font-mono text-5xl font-medium tracking-tight transition-[letter-spacing,color] duration-500 group-hover:tracking-[0.12em] group-hover:text-[var(--accent)]">
                      {p.cover}
                    </span>
                  </div>
                  <span className="text-muted absolute top-4 left-5 font-mono text-[11px]">
                    0{idx + 1}
                  </span>
                </div>
                <div className="p-6" style={{ transform: "translateZ(20px)" }}>
                  <span
                    className="mb-2 inline-block font-mono text-[11px] font-semibold tracking-wider uppercase"
                    style={{ color: "var(--accent)" }}
                  >
                    {p.tag}
                  </span>
                  <h3 className="mb-2 text-[17px] leading-snug font-semibold tracking-tight">
                    {p.title}
                  </h3>
                  <p className="text-muted mb-4 text-[13px] leading-relaxed">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tech.map((tt) => (
                      <span
                        key={tt}
                        className="rounded px-2 py-0.5 font-mono text-[11px]"
                        style={{ background: "var(--chip)", color: "var(--muted)" }}
                      >
                        {tt}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
