"use client";

import Link from "next/link";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

/**
 * Nav de las páginas de proyecto. Misma barra que la de la home, pero sin los enlaces
 * a secciones (#about...), que solo existen en la home: aquí lleva de vuelta a ella.
 */
export function ProjectNav() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();

  return (
    <nav
      className="sticky top-0 z-50 flex h-[72px] items-center border-b backdrop-blur-md"
      style={{
        background: "color-mix(in oklab, var(--bg) 85%, transparent)",
        borderColor: "var(--rule)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 md:px-8">
        <Link href="/" className="text-[15px] font-semibold tracking-tight">
          Ángel Fernández<span style={{ color: "var(--accent)" }}>.</span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setLocale(locale === "es" ? "en" : "es")}
            className="text-muted rounded-full border px-2.5 py-1.5 font-mono text-xs transition-colors hover:text-[var(--fg)]"
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
            className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors"
            style={{ borderColor: "var(--rule)" }}
          >
            {theme === "dark" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            )}
          </button>

          <Link href="/#contact" className="btn-primary !px-4 !py-2.5 !text-sm">
            {t("nav.ctaContact")}
          </Link>
        </div>
      </div>
    </nav>
  );
}
