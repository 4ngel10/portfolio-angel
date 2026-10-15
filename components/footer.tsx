"use client";

import { useId } from "react";
import { useI18n } from "@/lib/i18n";
import { Marquee, MarqueeDot } from "./marquee";
import { Reveal } from "./reveal";

const EMAIL = "angelfernandezgarriga@gmail.com";

/** Sello circular con texto girando alrededor y una flecha en el centro. */
function CircleBadge({ text, label }: { text: string; label: string }) {
  const id = useId();
  const r = 62;
  return (
    <a
      href="#contact"
      aria-label={label}
      className="group relative block h-36 w-36 shrink-0 md:h-44 md:w-44"
    >
      <svg viewBox="0 0 160 160" className="spin-slow absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path
            id={id}
            d={`M80,80 m-${r},0 a${r},${r} 0 1,1 ${r * 2},0 a${r},${r} 0 1,1 -${r * 2},0`}
          />
        </defs>
        <text className="font-mono uppercase" fontSize="11" letterSpacing="2" fill="currentColor">
          <textPath href={`#${id}`} textLength={2 * Math.PI * r} lengthAdjust="spacing">
            {text}
          </textPath>
        </text>
      </svg>
      <span
        className="absolute inset-0 m-auto flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform duration-300 group-hover:scale-110 group-active:scale-[0.97] md:h-16 md:w-16"
        style={{ background: "var(--accent)" }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-300 group-hover:rotate-45"
        >
          <line x1="7" y1="17" x2="17" y2="7" />
          <polyline points="7 7 17 7 17 17" />
        </svg>
      </span>
    </a>
  );
}

export function Footer() {
  const { t } = useI18n();

  const links = [
    { href: "#about", label: t("nav.about") },
    { href: "#services", label: t("nav.services") },
    { href: "#portfolio", label: t("nav.portfolio") },
    { href: "#contact", label: t("nav.contact") },
  ];

  return (
    <footer className="relative overflow-hidden bg-[#0f172a] text-slate-300 dark:border-t dark:border-slate-800 dark:bg-[#050506]">
      <div className="border-b border-white/10 py-5">
        <Marquee
          duration={35}
          items={Array(4).fill(t("footer.available"))}
          separator={<MarqueeDot />}
          itemClassName="text-lg md:text-2xl font-medium tracking-[-0.02em] text-slate-200"
        />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-20 md:px-8 md:py-28">
        <Reveal className="flex flex-col justify-between gap-12 md:flex-row md:items-end">
          <div className="min-w-0">
            <a
              href={`mailto:${EMAIL}`}
              className="group block text-[clamp(3rem,10vw,8rem)] leading-[0.9] font-semibold tracking-[-0.05em] text-white"
            >
              {t("footer.ctaTitle")}
            </a>
            <a
              href={`mailto:${EMAIL}`}
              className="group mt-10 inline-flex max-w-full items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] py-3 pr-5 pl-3 transition-[border-color,background-color] duration-300 hover:border-[var(--accent)] hover:bg-white/[0.06]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--accent)] transition-colors duration-300 group-hover:bg-[var(--accent)] group-hover:text-white">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <span className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-0.5">
                <span className="text-base font-medium text-white md:text-lg">
                  {t("footer.ctaLink")}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="shrink-0 text-slate-500 transition-[transform,color] duration-300 group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                  aria-hidden
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
                <span className="font-mono text-sm break-all text-slate-300 transition-colors duration-300 group-hover:text-white">
                  {EMAIL}
                </span>
              </span>
            </a>
          </div>
          <CircleBadge text={t("footer.circle")} label={t("footer.ctaLink")} />
        </Reveal>
      </div>

      <div className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-6 md:flex-row md:items-center md:px-8">
          <div className="text-[14px] font-medium text-slate-200">
            Ángel Fernández Garriga{" "}
            <span className="ml-2 font-normal text-slate-500">© {t("footer.year")}</span>
          </div>
          <nav className="flex flex-wrap gap-5 text-[13px] text-slate-400">
            {links.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
            ))}
            <a href="#top" className="transition-colors hover:text-white">
              {t("footer.backTop")} ↑
            </a>
          </nav>
          <div className="flex gap-2.5">
            <a
              href="https://www.linkedin.com/in/angelfernandezgarriga"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-[var(--accent)] hover:text-white"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
              </svg>
            </a>
            <a
              href="https://github.com/4ngel10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-[var(--accent)] hover:text-white"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
