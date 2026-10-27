"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { NavLink } from "./nav";

/** Pie de todas las páginas. Fuera de la home, las anclas apuntan a la home (/#about). */
export function Footer() {
  const { t } = useI18n();
  const isHome = usePathname() === "/";
  const home = (hash: string) => (isHome ? hash : `/${hash}`);

  const links = [
    { href: home("#about"), label: t("nav.about") },
    { href: home("#services"), label: t("nav.services") },
    { href: home("#portfolio"), label: t("nav.portfolio") },
    { href: home("#blog"), label: t("nav.blog") },
    { href: home("#contact"), label: t("nav.contact") },
    { href: "/login", label: t("nav.ctaClients") },
  ];

  return (
    <footer className="relative overflow-hidden bg-[var(--footer-bg)] text-slate-300 [--footer-bg:#0f172a] dark:border-t dark:border-slate-800 dark:[--footer-bg:#050506]">
      {/* Franja de disponibilidad (fija: el carrusel ya está en la banda de habilidades). */}
      <div className="border-b border-white/10 py-10 md:py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 md:flex-row md:items-center md:px-8">
          <div>
            <p className="flex items-start gap-3 text-2xl font-semibold tracking-[-0.03em] text-white md:text-3xl">
              <span
                className="relative mt-[11px] flex h-2.5 w-2.5 shrink-0 md:mt-[13px]"
                aria-hidden
              >
                <span
                  className="absolute inset-[-4px] rounded-full opacity-25"
                  style={{ background: "var(--accent)" }}
                />
                <span
                  className="relative h-2.5 w-2.5 rounded-full"
                  style={{ background: "var(--accent)" }}
                />
              </span>
              {t("footer.available")}
            </p>
            <p className="mt-2 pl-[22px] font-mono text-[13px] text-slate-400">
              {t("footer.reply")}
            </p>
          </div>
          <NavLink
            href={home("#contact")}
            className="group inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-[15px] font-medium text-white transition-[border-color,background-color,transform] duration-200 hover:border-[var(--accent)] hover:bg-[var(--accent)] dark:hover:text-[#0a0f1c] active:scale-[0.97]"
          >
            {t("nav.ctaContact")}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NavLink>
        </div>
      </div>

      <div className="py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-6 md:flex-row md:items-center md:px-8">
          <div className="text-[14px] font-medium text-slate-200">
            Ángel Fernández Garriga{" "}
            <span className="ml-2 font-normal text-slate-400">© {t("footer.year")}</span>
          </div>
          <nav
            aria-label={t("a11y.footerNav")}
            className="flex flex-wrap gap-5 text-[13px] text-slate-400"
          >
            {links.map((l) => (
              <NavLink key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </NavLink>
            ))}
            <a href="#top" className="transition-colors hover:text-white">
              {t("footer.backTop")} <span aria-hidden>↑</span>
            </a>
          </nav>
          <div className="flex gap-2.5">
            <a
              href="https://www.linkedin.com/in/angelfernandezgarriga"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-[var(--accent)] hover:text-white dark:hover:text-[#0a0f1c]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
              </svg>
            </a>
            <a
              href="https://github.com/4ngel10"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-[var(--accent)] hover:text-white dark:hover:text-[#0a0f1c]"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
        </div>
        <nav
          aria-label={t("footer.legalNav")}
          className="mx-auto mt-2 flex max-w-6xl flex-wrap gap-x-5 px-6 text-[13px] text-slate-400 md:px-8"
        >
          {[
            { href: "/aviso-legal", label: t("footer.legal") },
            { href: "/privacidad", label: t("footer.privacy") },
            { href: "/cookies", label: t("footer.cookies") },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="inline-flex min-h-11 items-center transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
