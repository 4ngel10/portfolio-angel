"use client";

import { Carousel } from "./carousel";
import { useI18n } from "@/lib/i18n";

const TECH = [
  "Hyper-V",
  "VMware",
  "Windows Server",
  "PowerShell",
  "Fortinet",
  "Veeam",
  "Proxmox",
  "Docker",
  "Zabbix",
  "NinjaOne",
  "Acronis",
  "Next.js",
  "TypeScript",
  "Vercel",
];

const TAGS = [
  "Omada OCNA Wireless",
  "Hornetsecurity Engineering",
  "3CX Basic Engineer V20",
  "ASIR",
  "Microsoft 365",
  "VLAN",
  "Backup 3-2-1",
  "Home Assistant",
];

export function StackBand() {
  const { t } = useI18n();

  return (
    <section
      aria-label={t("marquee.stack")}
      className="space-y-5 border-y py-8 md:py-10"
      style={{ borderColor: "var(--rule)" }}
    >
      <Carousel
        direction="right"
        speed={45}
        gap="2.5rem"
        items={TECH}
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
        speed={55}
        repeat={3}
        gap="1.25rem"
        items={TAGS}
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
