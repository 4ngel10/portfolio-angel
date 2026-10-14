"use client";

import { useI18n } from "@/lib/i18n";

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
    <section id="about" className="py-24 md:py-28 bg-paper-alt">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-tight tracking-[-0.025em] max-w-3xl">
          {t("about.title")}
        </h2>

        <div className="grid md:grid-cols-2 gap-14 md:gap-20 mt-14 items-start">
          <div className="space-y-5">
            <p className="text-base md:text-[17px] leading-[1.75] text-muted">{t("about.p1")}</p>
            <p className="text-base md:text-[17px] leading-[1.75] text-muted">{t("about.p2")}</p>
            <p className="text-base md:text-[17px] leading-[1.75] text-muted">{t("about.p3")}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted mb-4">
              {t("about.stackLabel")}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {STACK.map((cat) => (
                <div key={cat.label}>
                  <div className="text-[13px] font-semibold mb-2">{cat.label}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.items.map((it) => (
                      <span
                        key={it}
                        className="font-mono text-[11px] px-2.5 py-1 rounded-md border"
                        style={{ borderColor: "var(--rule)", background: "var(--bg)" }}
                      >
                        {it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted mb-4 mt-10">
              {t("about.certsLabel")}
            </h3>
            <div className="flex flex-col gap-2.5">
              {CERTS.map((c) => (
                <div
                  key={c.title}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                  style={{ borderColor: "var(--rule)", background: "var(--bg)" }}
                >
                  <span
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)", color: "var(--accent)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="7" />
                      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                    </svg>
                  </span>
                  <div className="text-[13px] leading-tight">
                    <div className="font-semibold text-ink">{c.title}</div>
                    <div className="text-muted text-[12px] mt-0.5">{c.meta}</div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted mb-3 mt-10">
              {t("about.eduLabel")}
            </h3>
            <div className="text-[13px] text-muted leading-relaxed">
              <div>{t("about.edu1")}</div>
              <div>{t("about.edu2")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
