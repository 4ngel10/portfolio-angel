"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";

/** Pie de las páginas de proyecto: la franja inferior del footer de la home. */
export function ProjectFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-[var(--footer-bg)] text-slate-300 [--footer-bg:#0f172a] [.dark_&]:border-t [.dark_&]:border-slate-800 [.dark_&]:[--footer-bg:#050506]">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-6 py-8 md:flex-row md:items-center md:px-8">
        <div className="text-[14px] font-medium text-slate-200">
          Ángel Fernández Garriga{" "}
          <span className="ml-2 font-normal text-slate-500">© {t("footer.year")}</span>
        </div>
        <nav className="flex flex-wrap gap-5 text-[13px] text-slate-400">
          <Link href="/" className="transition-colors hover:text-white">
            {t("project.home")}
          </Link>
          <Link href="/#portfolio" className="transition-colors hover:text-white">
            {t("nav.portfolio")}
          </Link>
          <Link href="/#contact" className="transition-colors hover:text-white">
            {t("nav.contact")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
