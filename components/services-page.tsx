"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { Bullet } from "./bullet";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { Inline } from "./project-article";
import { Process } from "./process";
import { RealProjects } from "./real-projects";
import { SERVICE_ICONS } from "./service-icons";
import { useI18n } from "@/lib/i18n";
import type { ProjectCard } from "@/lib/projects";
import type { ServiceDetail } from "@/lib/services";

const Arrow = ({ back = false }: { back?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 transition-transform duration-200 ${back ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"}`}
    aria-hidden
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// Mismo lenguaje de hover que las cards de la home: borde de acento, sombra y título que crece.
const CARD =
  "group border-rule h-full rounded-2xl border transition-[box-shadow,border-color] duration-300 hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)]";
const CARD_BG = { background: "var(--bg)" };
const TITLE_HOVER =
  "inline-block origin-left transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06] group-hover:font-bold";
// Tarjeta a la que se ha llegado por ancla: se queda con el aspecto del hover.
const TARGETED = "shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)]";
/** Altura de la nav fija más un poco de aire, para que el apartado no quede debajo. */
const NAV_OFFSET = 88;

/**
 * Página de un servicio: /servicios/[id]. Recibe por props solo este servicio, el otro (clave e id
 * para la card final) y las cards de sus proyectos, para que el contenido del resto no viaje.
 */
export function ServicePage({
  service,
  other,
  projects,
}: {
  service: ServiceDetail;
  other: { id: string; key: string };
  projects: (ProjectCard | "self")[];
}) {
  const { t, locale } = useI18n();
  // Apartado al que se llega desde un punto de la home (#redes...). No se usa :target porque
  // la navegación de Next cambia el hash con pushState y el navegador no lo activa.
  const [target, setTarget] = useState<string | null>(null);
  useEffect(() => {
    // El scroll al apartado lo hace la página, no Next: los enlaces de la home van con
    // scroll={false}. Next podía desplazar antes de montar la página y, al cambiar la altura,
    // dejar al visitante en otra sección ("Cómo trabajo"). Se repite un instante después
    // por si algo cambia de tamaño al terminar de cargar (fuentes, idioma).
    const timers: ReturnType<typeof setTimeout>[] = [];
    const goTo = (anchor: string) => {
      const el = document.getElementById(anchor);
      if (!el) return;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET,
        behavior: "instant",
      });
    };
    const read = () => {
      const anchor = decodeURIComponent(location.hash.slice(1)) || null;
      setTarget(anchor);
      if (!anchor) return;
      requestAnimationFrame(() => goTo(anchor));
      timers.push(setTimeout(() => goTo(anchor), 350));
    };
    read();
    window.addEventListener("hashchange", read);
    return () => {
      window.removeEventListener("hashchange", read);
      timers.forEach(clearTimeout);
    };
  }, []);
  const [lead, ...rest] = service.intro[locale];
  const modes = service.modes?.[locale];
  const faq = service.faq?.[locale];
  // Los fondos alternan según el orden en que se pintan las secciones (la cabecera no lleva).
  let sections = 0;
  const bg = () => (++sections % 2 === 1 ? "bg-paper-alt" : "");

  return (
    <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
      <header className="mx-auto max-w-6xl px-6 pt-14 pb-20 md:px-8 md:pt-20 md:pb-24">
        <Reveal>
          <Link
            href="/#services"
            className="group text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--fg)]"
          >
            <Arrow back />
            {t("servicesPage.back")}
          </Link>

          <div className="mt-10 flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] text-[var(--accent)] transition-[background-color,color,transform] duration-300 hover:scale-110 hover:-rotate-6 hover:bg-[var(--accent)] hover:text-white dark:hover:text-[#0a0f1c]">
            {SERVICE_ICONS[service.key]}
          </div>

          <h1 className="mt-6 text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
            {t(`services.${service.key}Title`)}
          </h1>
          <p className="text-muted mt-6 max-w-[65ch] text-[17px] leading-[1.75]">{lead}</p>
          {rest.map((p, i) => (
            <p key={i} className="text-muted mt-5 max-w-[65ch] text-[17px] leading-[1.75]">
              {p}
            </p>
          ))}
          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <Link href="/#contact" className="btn-primary group self-start">
              {t("nav.ctaContact")}
              <Arrow />
            </Link>
            <p className="text-muted text-sm">{t("servicesPage.callNote")}</p>
          </div>
        </Reveal>
      </header>

      <section className={`border-rule ${bg()} border-t py-20 md:py-28`}>
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <RevealGroup className="grid gap-5 md:grid-cols-2" stagger={0.06}>
            {service.groups[locale].map((g) => (
              // id = ancla del apartado: los puntos de la home enlazan aquí (/servicios/sistemas#redes).
              // scroll-mt deja sitio a la nav fija; :target resalta la tarjeta a la que se llega.
              <RevealItem key={g.id} id={g.id} className="h-full scroll-mt-24">
                <div
                  className={`${CARD} relative flex flex-col p-7 md:p-8 ${target === g.id ? TARGETED : ""}`}
                  // El borde va en línea: la clase border-rule de CARD pisaría a una utilidad.
                  style={target === g.id ? { ...CARD_BG, borderColor: "var(--accent)" } : CARD_BG}
                >
                  <h2 className="text-[19px] leading-snug font-semibold tracking-tight">
                    <span className={TITLE_HOVER}>{g.title}</span>
                  </h2>
                  {g.lead && (
                    <p className="text-muted mt-2 text-[15px] leading-relaxed">{g.lead}</p>
                  )}
                  <ul className="mt-4 flex flex-col gap-3">
                    {g.items.map((item, i) => (
                      <li
                        key={i}
                        className="text-muted flex gap-3 text-[15px] leading-relaxed transition-[transform,color] duration-200 hover:translate-x-1 hover:text-[var(--fg)]"
                      >
                        <Bullet />
                        <span>
                          <Inline text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                  {g.tools && (
                    <p className="text-muted mt-auto pt-6 font-mono text-[11px] leading-relaxed">
                      {g.tools.map((tool, i) => (
                        // El separador va pegado a su tecnología (span sin saltos) y el espacio
                        // queda fuera: el salto de línea cae después del punto, nunca antes.
                        <Fragment key={tool}>
                          <span className="whitespace-nowrap">
                            {tool}
                            {i < g.tools!.length - 1 ? " ·" : ""}
                          </span>
                          {i < g.tools!.length - 1 ? " " : ""}
                        </Fragment>
                      ))}
                    </p>
                  )}
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      {projects.length > 0 && (
        <section className={`border-rule ${bg()} border-t py-20 md:py-28`}>
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <RealProjects title={t("servicesPage.projectsTitle")} items={projects} />
          </div>
        </section>
      )}

      {modes && (
        <section className={`border-rule ${bg()} border-t py-20 md:py-28`}>
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <Reveal>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
                {modes.title}
              </h2>
              <p className="text-muted mt-5 max-w-[65ch] text-[17px] leading-relaxed">
                {modes.lead}
              </p>
            </Reveal>
            <RevealGroup className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
              {modes.items.map((m) => (
                <RevealItem key={m.title} id={m.id} className="h-full scroll-mt-24">
                  <div className={`${CARD} p-6`} style={CARD_BG}>
                    <h3 className="text-[17px] font-semibold tracking-tight">
                      <span className={TITLE_HOVER}>{m.title}</span>
                    </h3>
                    <p className="text-muted mt-2 text-[14px] leading-relaxed">{m.text}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
            <Reveal>
              <p className="text-muted mt-8 max-w-[65ch] text-sm leading-relaxed">{modes.note}</p>
            </Reveal>
          </div>
        </section>
      )}

      <section className={`border-rule ${bg()} border-t py-20 md:py-28`}>
        <Process service={service.id === "web" ? "web" : "sistemas"} />
      </section>

      {faq && (
        <section className={`border-rule ${bg()} border-t py-20 md:py-28`}>
          <div className="mx-auto max-w-6xl px-6 md:px-8">
            <Reveal>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
                {faq.title}
              </h2>
            </Reveal>
            <Reveal>
              <div className="border-rule mt-10 max-w-3xl border-t">
                {faq.items.map((it) => (
                  <details key={it.q} className="group border-rule border-b">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[17px] font-semibold tracking-tight transition-colors hover:text-[var(--accent)] [&::-webkit-details-marker]:hidden">
                      {it.q}
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted shrink-0 motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-open:rotate-180"
                        aria-hidden
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </summary>
                    <p className="text-muted pb-5 text-[15px] leading-relaxed">{it.a}</p>
                  </details>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      <section className={`border-rule ${bg()} border-t`}>
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
          <Link href={`/servicios/${other.id}`} className="block">
            <div
              className={`${CARD} flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-10`}
              style={CARD_BG}
            >
              <span className="flex items-center gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] text-[var(--accent)] transition-[background-color,color,transform] duration-300 group-hover:-rotate-6 group-hover:bg-[var(--accent)] group-hover:text-white dark:group-hover:text-[#0a0f1c]">
                  {SERVICE_ICONS[other.key]}
                </span>
                <span>
                  <span className="text-muted block text-sm font-medium">
                    {t("servicesPage.other")}
                  </span>
                  <span className="mt-1 block text-[clamp(1.5rem,3.5vw,2.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] transition-colors duration-200 group-hover:text-[var(--accent)]">
                    {t(`services.${other.key}Title`)}
                  </span>
                </span>
              </span>
              <span className="text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors duration-200 group-hover:text-[var(--accent)]">
                {t("servicesPage.more")}
                <Arrow />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className={`border-rule ${bg()} border-t py-20 md:py-28`}>
        <Reveal className="mx-auto max-w-4xl px-6 text-center md:px-8">
          <h2 className="text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("contact.title")}
          </h2>
          <p className="text-muted mx-auto mt-5 max-w-xl text-[17px] leading-relaxed">
            {service.closing[locale]}
          </p>
          <Link href="/#contact" className="btn-primary group mt-10">
            {t("nav.ctaContact")}
            <Arrow />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
