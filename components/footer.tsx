"use client";

import { useI18n } from "@/lib/i18n";
import { Carousel } from "./carousel";

export function Footer() {
  const { t } = useI18n();

  const links = [
    { href: "#about", label: t("nav.about") },
    { href: "#services", label: t("nav.services") },
    { href: "#portfolio", label: t("nav.portfolio") },
    // Página aparte (no es una sección de la home): el scroll spy no la marca.
    { href: "/blog", label: t("nav.blog") },
    { href: "#contact", label: t("nav.contact") },
  ];

  return (
    <footer className="relative overflow-hidden bg-[var(--footer-bg)] text-slate-300 [--footer-bg:#0f172a] dark:border-t dark:border-slate-800 dark:[--footer-bg:#050506]">
      <div className="border-b border-white/10 py-4">
        {/* Mismo carrusel que la banda de habilidades: continuo, sin pausa en hover. */}
        <Carousel
          direction="right"
          speed={9}
          repeat={10}
          gap="2rem"
          fadeColor="var(--footer-bg)"
          items={[t("footer.available")]}
          label={t("footer.available")}
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
          itemClassName="text-lg md:text-2xl font-medium tracking-[-0.02em] text-slate-200"
        />
      </div>

      <div className="py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-5 px-6 md:flex-row md:items-center md:px-8">
          <div className="text-[14px] font-medium text-slate-200">
            Ángel Fernández Garriga{" "}
            <span className="ml-2 font-normal text-slate-500">© {t("footer.year")}</span>
          </div>
          <nav
            aria-label={t("a11y.footerNav")}
            className="flex flex-wrap gap-5 text-[13px] text-slate-400"
          >
            {links.map((l) => (
              <a key={l.href} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
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
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-[var(--accent)] hover:text-white"
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
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition-colors hover:bg-[var(--accent)] hover:text-white"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
