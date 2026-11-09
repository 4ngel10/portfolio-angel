"use client";

import Link from "next/link";
import { Arrow } from "./project-article";
import { SERVICE_ICONS } from "./service-icons";
import { useI18n } from "@/lib/i18n";

const SVG = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const ICON_PROJECTS = (
  <svg {...SVG}>
    <rect x="3" y="3" width="7" height="7" rx="1" />
    <rect x="14" y="3" width="7" height="7" rx="1" />
    <rect x="3" y="14" width="7" height="7" rx="1" />
    <rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const ICON_BLOG = (
  <svg {...SVG}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="16" y2="17" />
  </svg>
);

const LINKS = [
  { key: "sistemas", href: "/servicios/sistemas", icon: SERVICE_ICONS.s1 },
  { key: "web", href: "/servicios/web", icon: SERVICE_ICONS.s2 },
  { key: "projects", href: "/#portfolio", icon: ICON_PROJECTS },
  { key: "blog", href: "/blog", icon: ICON_BLOG },
];

/** Contenido de la página 404 (app/not-found.tsx), con el mismo lenguaje que las páginas interiores. */
export function NotFoundContent() {
  const { t } = useI18n();

  return (
    <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
      <div className="mx-auto w-full max-w-6xl px-6 py-14 md:px-8 md:py-20">
        <div className="font-mono text-[15px] md:text-lg">
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span style={{ color: "var(--accent)" }} aria-hidden>
              ~/angel $
            </span>
            <span className="text-ink">{t("notFound.cmd")}</span>
            <span
              className="caret -mb-[0.15em] inline-block h-[1.1em] w-[0.55em]"
              style={{ background: "var(--accent)" }}
              aria-hidden
            />
          </p>
          <p className="text-muted mt-1">{t("notFound.err")}</p>
        </div>

        <h1 className="mt-6 max-w-5xl text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
          {t("notFound.title")}
        </h1>
        <p className="text-muted mt-6 max-w-2xl text-[19px] leading-relaxed">
          {t("notFound.lead")}
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {LINKS.map((l) => (
            <li key={l.key}>
              <Link
                href={l.href}
                className="group border-rule flex h-full flex-col gap-3 rounded-2xl border p-5 transition-[border-color,box-shadow] duration-300 hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                style={{ background: "var(--bg)" }}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] text-[var(--accent)]">
                  {l.icon}
                </span>
                <span className="text-[17px] leading-snug font-semibold tracking-tight">
                  {t(`notFound.links.${l.key}.title`)}
                </span>
                <span className="text-muted text-sm leading-relaxed">
                  {t(`notFound.links.${l.key}.text`)}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <Link href="/" className="btn-primary group self-start">
            <Arrow back />
            {t("notFound.home")}
          </Link>
          <Link
            href="/#contact"
            className="text-sm font-medium text-[var(--accent)] underline decoration-1 underline-offset-4 transition-colors hover:text-[var(--fg)]"
          >
            {t("notFound.quote")}
          </Link>
        </div>
      </div>
    </main>
  );
}
