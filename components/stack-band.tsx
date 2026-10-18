"use client";

import { Carousel } from "./carousel";
import { useI18n } from "@/lib/i18n";

// Nombres propios: iguales en todos los idiomas.
const TECH = [
  "Hyper-V",
  "VMware",
  "Active Directory",
  "Windows Server",
  "PowerShell",
  "Fortinet",
  "Veeam",
  "Azure",
  "Proxmox",
  "Docker",
  "Zabbix",
  "Next.js",
  "NinjaOne",
  "UniFi",
  "Acronis",
  "TypeScript",
  "Vercel",
  "Intune",
  "Grafana",
  "pfSense",
  "OPNsense",
  "GitLab",
  "Nginx",
  "Apache",
  "SOTI",
];

// Áreas de trabajo: traducidas en messages/*.json (marquee.area1..area12).
const AREA_KEYS = Array.from({ length: 12 }, (_, i) => `marquee.area${i + 1}`);

export function StackBand() {
  const { t } = useI18n();
  const areas = AREA_KEYS.map((k) => t(k));

  return (
    <section
      aria-label={t("marquee.stack")}
      className="space-y-5 border-y py-8 md:py-10"
      style={{ borderColor: "var(--rule)" }}
    >
      <Carousel
        direction="right"
        speed={77}
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
      <Carousel
        direction="right"
        speed={124}
        repeat={2}
        gap="1.25rem"
        items={areas}
        label={t("marquee.areas")}
        separator={
          <span className="opacity-40" aria-hidden>
            /
          </span>
        }
        itemClassName="font-mono text-xs md:text-sm uppercase tracking-[0.12em] text-muted"
      />
    </section>
  );
}
