"use client";

import { useI18n } from "@/lib/i18n";

/**
 * "Ir al contenido principal": primer elemento enfocable de cada página. Oculto hasta
 * que recibe el foco con Tab; lleva al <main id="main"> de la página.
 */
export function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main"
      className="btn-primary sr-only !fixed top-3 left-3 z-[100] focus:not-sr-only focus:!px-4 focus:!py-2.5 focus:!text-sm"
    >
      {t("a11y.skip")}
    </a>
  );
}
