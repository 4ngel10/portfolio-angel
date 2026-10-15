"use client";

import { useI18n } from "@/lib/i18n";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

const STACK: { label: string; items: string[] }[] = [
  { label: "Virtualización", items: ["Hyper-V", "VMware"] },
  { label: "Sistemas", items: ["Windows Server", "PowerShell"] },
  { label: "Seguridad & Red", items: ["Fortinet", "Hornetsecurity"] },
  { label: "Backup", items: ["Veeam", "Acronis"] },
  { label: "Gestión", items: ["NinjaOne", "Zabbix", "SOTI"] },
  { label: "Web", items: ["Next.js", "TypeScript", "Vercel"] },
];

const CERTS = [
  { title: "Omada OCNA Wireless", meta: "TP-Link · 2026" },
  { title: "Hornetsecurity Engineering", meta: "Microsoft 365 · 2025" },
  { title: "3CX Basic Engineer V20", meta: "Comunicaciones · 2025" },
];

export function About() {
  const { t } = useI18n();

  return (
    <section id="about" className="bg-paper-alt py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <Reveal>
          <h2 className="max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("about.title")}
          </h2>
        </Reveal>

        <div className="mt-14 grid items-start gap-14 md:grid-cols-2 md:gap-20">
          <RevealGroup className="space-y-5" stagger={0.12}>
            <RevealItem as="div">
              <p className="text-muted text-base leading-[1.75] md:text-[17px]">{t("about.p1")}</p>
            </RevealItem>
            <RevealItem as="div">
              <p className="text-muted text-base leading-[1.75] md:text-[17px]">{t("about.p2")}</p>
            </RevealItem>
            <RevealItem as="div">
              <p className="text-muted text-base leading-[1.75] md:text-[17px]">{t("about.p3")}</p>
            </RevealItem>
          </RevealGroup>

          <div>
            <h3 className="text-muted mb-4 text-xs font-semibold tracking-[0.08em] uppercase">
              {t("about.stackLabel")}
            </h3>
            <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-5" stagger={0.07}>
              {STACK.map((cat) => (
                <RevealItem key={cat.label}>
                  <div className="mb-2 text-[13px] font-semibold">{cat.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((it) => (
                      <span
                        key={it}
                        className="border-rule rounded-md border px-2.5 py-1 font-mono text-[11px] transition-[transform,border-color,color] duration-200 hover:-translate-y-0.5 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        style={{ background: "var(--bg)" }}
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <h3 className="text-muted mt-10 mb-4 text-xs font-semibold tracking-[0.08em] uppercase">
              {t("about.certsLabel")}
            </h3>
            <RevealGroup className="flex flex-col gap-2.5" stagger={0.1}>
              {CERTS.map((c) => (
                <RevealItem
                  key={c.title}
                  className="group border-rule flex items-center gap-3 rounded-xl border px-4 py-3 transition-[transform,border-color] duration-200 hover:translate-x-1 hover:border-[var(--accent)]"
                  style={{ background: "var(--bg)" }}
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{
                      background: "color-mix(in oklab, var(--accent) 10%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                  </span>
                  <div className="text-[13px] leading-tight">
                    <div className="text-ink font-semibold">{c.title}</div>
                    <div className="text-muted mt-0.5 text-[12px]">{c.meta}</div>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>

            <h3 className="text-muted mt-10 mb-3 text-xs font-semibold tracking-[0.08em] uppercase">
              {t("about.eduLabel")}
            </h3>
            <div className="text-muted text-[13px] leading-relaxed">
              <div>{t("about.edu1")}</div>
              <div>{t("about.edu2")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
