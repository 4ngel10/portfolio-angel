"use client";

import Link from "next/link";
import { Arrow } from "./project-article";
import { useI18n } from "@/lib/i18n";

/** Contenido de la página 404 (app/not-found.tsx), con el mismo lenguaje que las páginas interiores. */
export function NotFoundContent() {
  const { t } = useI18n();

  return (
    <main
      id="main"
      tabIndex={-1}
      className="relative flex min-h-[calc(100svh-72px)] scroll-mt-[72px] items-center overflow-hidden outline-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: "radial-gradient(var(--rule) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-4xl px-6 py-20 md:px-8">
        <p className="font-mono text-sm" style={{ color: "var(--accent)" }}>
          ~/angel $ {t("notFound.code")}
        </p>
        <h1 className="mt-6 text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
          {t("notFound.title")}
        </h1>
        <p className="text-muted mt-6 max-w-2xl text-[19px] leading-relaxed">
          {t("notFound.lead")}
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="btn-primary group">
            <Arrow back />
            {t("notFound.home")}
          </Link>
          <Link href="/#portfolio" className="btn-secondary">
            {t("notFound.projects")}
          </Link>
        </div>
      </div>
    </main>
  );
}
