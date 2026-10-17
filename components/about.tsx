"use client";

import { useI18n } from "@/lib/i18n";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
// Los párrafos admiten **negrita** (mismo formato que los artículos).
import { Inline } from "./project-article";

// Mismas herramientas que la fila 1 del carrusel (components/stack-band.tsx), por área.
// Si añades o quitas una allí, refléjalo aquí. Hornetsecurity solo está aquí, no en el carrusel.
const STACK: { labelKey: string; items: string[] }[] = [
  { labelKey: "about.catVirt", items: ["Hyper-V", "VMware", "Proxmox", "Docker"] },
  {
    labelKey: "about.catSystems",
    items: ["Windows Server", "Active Directory", "PowerShell", "Azure"],
  },
  {
    labelKey: "about.catNetwork",
    items: ["Fortinet", "pfSense", "OPNsense", "UniFi", "Hornetsecurity"],
  },
  { labelKey: "about.catBackup", items: ["Veeam", "Acronis"] },
  { labelKey: "about.catManagement", items: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"] },
  {
    labelKey: "about.catWeb",
    items: ["Next.js", "TypeScript", "Vercel", "GitLab", "Nginx", "Apache"],
  },
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
          <RevealGroup className="space-y-5" stagger={0.08}>
            <RevealItem as="div">
              <p className="text-muted text-base leading-[1.75] md:text-[17px]"><Inline text={t("about.p1")} /></p>
            </RevealItem>
            <RevealItem as="div">
              <p className="text-muted text-base leading-[1.75] md:text-[17px]"><Inline text={t("about.p2")} /></p>
            </RevealItem>
            <RevealItem as="div">
              <p className="text-muted text-base leading-[1.75] md:text-[17px]"><Inline text={t("about.p3")} /></p>
            </RevealItem>
          </RevealGroup>

          <div>
            <h3 className="text-muted mb-4 text-xs font-semibold tracking-[0.08em] uppercase">
              {t("about.stackLabel")}
            </h3>
            <RevealGroup className="grid grid-cols-2 gap-x-6 gap-y-5" stagger={0.07}>
              {STACK.map((cat) => (
                <RevealItem key={cat.labelKey}>
                  <div className="mb-2 text-[13px] font-semibold">{t(cat.labelKey)}</div>
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
          </div>
        </div>
      </div>
    </section>
  );
}
