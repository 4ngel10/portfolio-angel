"use client";

import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { usePT } from "./i18n-provider";

/**
 * Botones de idioma (ES / EN) y de vista clara u oscura. Mismo aspecto que los de la web
 * pública. El idioma se guarda en la cookie "locale" y se refresca la página para que el
 * servidor la vuelva a pintar en el idioma nuevo.
 */
export function Prefs() {
  const router = useRouter();
  const { locale, t } = usePT();
  const { setLocale } = useI18n();
  const { theme, toggle } = useTheme();

  function cambiarIdioma() {
    const next = locale === "es" ? "en" : "es";
    setLocale(next); // guarda también la cookie y el idioma de la web pública
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={cambiarIdioma}
        className="text-muted rounded-full border border-rule px-2.5 py-1.5 font-mono text-xs transition-[color,border-color,background-color,opacity,transform] duration-150 ease-[var(--ease-out)] hover:text-[var(--fg)] active:scale-[0.97]"
        aria-label={t("common.toggleLanguage")}
      >
        <span className={locale === "es" ? "text-ink font-semibold" : ""}>ES</span>
        <span className="mx-1 opacity-40" aria-hidden>
          /
        </span>
        <span className={locale === "en" ? "text-ink font-semibold" : ""}>EN</span>
      </button>

      <button
        type="button"
        onClick={toggle}
        aria-label={t("common.toggleTheme")}
        className="flex size-9 items-center justify-center rounded-xl border border-rule transition-[color,border-color,background-color,opacity,transform] duration-150 ease-[var(--ease-out)] hover:border-[var(--fg)] active:scale-[0.97]"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          {theme === "dark" ? (
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
