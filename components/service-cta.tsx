"use client";

import Link from "next/link";
import { Reveal } from "./reveal";
import { Arrow } from "./project-article";
import { SERVICE_ICONS } from "./service-icons";
import { useI18n } from "@/lib/i18n";

/**
 * Llamada al servicio del final de proyectos y artículos del blog.
 * Fondo alterno (paper-alt): la sección siguiente va sin fondo. Sin tilt.
 */
export function ServiceCta({ service }: { service: "web" | "sistemas" }) {
  const { t, l } = useI18n();
  return (
    <section className="bg-paper-alt border-rule border-t">
      <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
        <Reveal>
          <div
            className="border-rule flex flex-col gap-6 rounded-2xl border p-7 md:p-10"
            style={{ background: "var(--bg)" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] text-[var(--accent)]">
              {SERVICE_ICONS[service === "web" ? "s2" : "s1"]}
            </div>
            <h2 className="text-[clamp(1.5rem,3vw,2rem)] leading-tight font-semibold tracking-[-0.03em]">
              {t(`project.cta.${service}Title`)}
            </h2>
            <p className="text-muted max-w-2xl text-[17px] leading-[1.75]">
              {t(`project.cta.${service}Text`)}
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <Link href={l(`/servicios/${service}`)} className="btn-primary group self-start">
                {t(`project.cta.${service}Button`)}
                <Arrow />
              </Link>
              <Link
                href={l("/#contact")}
                className="text-sm font-medium text-[var(--accent)] underline decoration-1 underline-offset-4 transition-colors hover:text-[var(--fg)]"
              >
                {t("nav.ctaContact")}
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
