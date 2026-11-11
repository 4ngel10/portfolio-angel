"use client";

import { useI18n } from "@/lib/i18n";
import { CV } from "@/lib/site";
import { Reveal, RevealGroup, RevealItem } from "./reveal";

// Stack completo por área. La banda de components/stack-band.tsx solo muestra una selección
// de 12 (alternando sistemas y web), así que aquí hay más herramientas que allí.
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
  { labelKey: "about.catBackup", items: ["Nakivo", "Veeam", "Acronis"] },
  { labelKey: "about.catManagement", items: ["NinjaOne", "Intune", "SOTI", "Zabbix", "Grafana"] },
  {
    labelKey: "about.catWeb",
    items: [
      "Next.js",
      "TypeScript",
      "Vercel",
      "Shopify",
      "Google Ads",
      "GitLab",
      "Nginx",
      "Apache",
    ],
  },
];

function StackCategory({ cat }: { cat: (typeof STACK)[number] }) {
  const { t } = useI18n();
  return (
    <>
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
    </>
  );
}

export function About() {
  const { t, locale } = useI18n();

  return (
    <section id="about" className="bg-paper-alt scroll-mt-[72px] py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <Reveal>
          <h2 className="max-w-4xl text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("about.title")}
          </h2>
        </Reveal>

        <RevealGroup className="mt-10 max-w-3xl space-y-6" stagger={0.08}>
          <RevealItem as="div">
            <p className="text-muted text-base leading-[1.75] md:text-[17px]">{t("about.p1")}</p>
          </RevealItem>
          <RevealItem as="div">
            <p className="text-muted text-base leading-[1.75] md:text-[17px]">{t("about.p2")}</p>
          </RevealItem>
          {CV[locale] && (
            <RevealItem as="div">
              <a href={CV[locale]} download className="btn-secondary">
                {t("about.cvLink")}
              </a>
            </RevealItem>
          )}
        </RevealGroup>

        <div className="mt-16">
          <Reveal>
            <p className="text-muted mb-6 max-w-3xl text-[15px] leading-relaxed">
              {t("about.stackDaily")}
            </p>
          </Reveal>

          {/* Desde md, el stack se ve abierto. Por debajo, plegado en un <details> nativo
              (funciona sin JS y con teclado). Dos bloques, uno oculto con display:none según
              el ancho, para no depender de forzar el estado "open" por CSS o JS. */}
          <div className="hidden md:block">
            <RevealGroup className="grid grid-cols-3 gap-x-6 gap-y-5" stagger={0.07}>
              {STACK.map((cat) => (
                <RevealItem key={cat.labelKey}>
                  <StackCategory cat={cat} />
                </RevealItem>
              ))}
            </RevealGroup>
          </div>

          <details className="group md:hidden">
            <summary className="border-rule text-muted flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 border-y py-2 text-sm font-semibold transition-colors hover:text-[var(--fg)] [&::-webkit-details-marker]:hidden">
              {t("about.stackOpen")}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-open:rotate-180"
                aria-hidden
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5 pt-5">
              {STACK.map((cat) => (
                <div key={cat.labelKey}>
                  <StackCategory cat={cat} />
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
