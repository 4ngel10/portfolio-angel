"use client";

import { TechList } from "./tech-list";
import { useI18n } from "@/lib/i18n";

// Nombres propios: iguales en todos los idiomas.
// Alternan sistemas y web. Lista estática (ver tech-list.tsx).
const TECH = [
  "Windows Server",
  "Next.js",
  "Microsoft 365",
  "TypeScript",
  "Active Directory",
  "Shopify",
  "Hyper-V",
  "Vercel",
  "Fortinet",
  "Proxmox",
  "Veeam",
  "Intune",
];

export function StackBand() {
  const { t } = useI18n();

  return (
    <section className="border-y py-6 md:py-8" style={{ borderColor: "var(--rule)" }}>
      <TechList
        gap="2.5rem"
        items={TECH}
        label={t("marquee.stack")}
        separator={
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            className="shrink-0"
            style={{ color: "var(--accent)" }}
            aria-hidden
          >
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
          </svg>
        }
        itemClassName="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-muted"
      />
    </section>
  );
}
