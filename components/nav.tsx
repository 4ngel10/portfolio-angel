"use client";

import { useState } from "react";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

export function Nav() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#about", label: t("nav.about") },
    { href: "#services", label: t("nav.services") },
    { href: "#portfolio", label: t("nav.portfolio") },
    { href: "#contact", label: t("nav.contact") },
  ];

  return (
    <nav
      className="sticky top-0 z-50 h-[72px] flex items-center backdrop-blur-md border-b"
      style={{ background: "color-mix(in oklab, var(--bg) 85%, transparent)", borderColor: "var(--rule)" }}
    >
      <div className="w-full max-w-6xl mx-auto px-6 md:px-8 flex items-center justify-between gap-3">
        <a href="#top" className="font-semibold text-[15px] tracking-tight">
          Ángel Fernández<span style={{ color: "var(--accent)" }}>.</span>
        </a>

        <div className="hidden md:flex items-center gap-9 text-sm font-medium text-muted">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-ink transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setLocale(locale === "es" ? "en" : "es")}
            className="font-mono text-xs px-2.5 py-1.5 border rounded-full text-muted hover:text-ink transition-colors"
            style={{ borderColor: "var(--rule)" }}
            aria-label="Toggle language"
          >
            <span className={locale === "es" ? "text-ink font-semibold" : ""}>ES</span>
            <span className="mx-1 opacity-40">/</span>
            <span className={locale === "en" ? "text-ink font-semibold" : ""}>EN</span>
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={t("a11y.toggleTheme")}
            className="w-9 h-9 rounded-xl border flex items-center justify-center transition-colors"
            style={{ borderColor: "var(--rule)" }}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            )}
          </button>

          <a href="#contact" className="hidden md:inline-flex btn-primary !py-2.5 !px-4 !text-sm">
            {t("nav.ctaContact")}
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("a11y.toggleMenu")}
            aria-expanded={open}
            className="md:hidden w-9 h-9 rounded-xl border flex items-center justify-center"
            style={{ borderColor: "var(--rule)" }}
          >
            {open ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="md:hidden absolute top-[72px] left-0 right-0 border-b px-6 py-5 flex flex-col gap-4 text-base font-medium"
          style={{ background: "var(--bg)", borderColor: "var(--rule)" }}
        >
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
