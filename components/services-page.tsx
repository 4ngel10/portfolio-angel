"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { TiltCard } from "./tilt-card";
import { Inline } from "./project-article";
import { SERVICE_ICONS } from "./service-icons";
import { useI18n } from "@/lib/i18n";
import { SERVICES, PRINCIPLES, getService } from "@/lib/services";

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
const CHIP =
  "rounded px-2 py-0.5 font-mono text-[11px] transition-[transform,color,background-color] duration-200 hover:-translate-y-0.5 hover:text-[var(--accent)]";
const CHIP_STYLE = { background: "var(--chip)", color: "var(--muted)" };

const Check = () => (
  <svg
    className="mt-[0.4em] shrink-0"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ color: "var(--accent)" }}
    aria-hidden
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/** Altura de la nav fija más un poco de aire, para que el apartado no quede debajo. */
const NAV_OFFSET = 88;

/** Página de un servicio: /servicios/[id]. */
export function ServicePage({ id }: { id: string }) {
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
  // La ruta ya valida el id (notFound), aquí siempre existe.
  const service = getService(id)!;
  const idx = SERVICES.indexOf(service);
  const other = SERVICES[(idx + 1) % SERVICES.length];
  const [lead, ...rest] = service.intro[locale];

  return (
    <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
      <header className="mx-auto max-w-4xl px-6 pt-14 pb-20 md:px-8 md:pt-20 md:pb-24">
        <Reveal>
          <Link
            href="/#services"
            className="group text-muted inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--fg)]"
          >
            <Arrow back />
            {t("servicesPage.back")}
          </Link>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] text-[var(--accent)] transition-[background-color,color,transform] duration-300 hover:scale-110 hover:-rotate-6 hover:bg-[var(--accent)] hover:text-white">
              {SERVICE_ICONS[service.key]}
            </div>
            <span
              className="font-mono text-4xl font-medium tracking-tight opacity-25"
              style={{ color: "var(--accent)" }}
              aria-hidden
            >
              0{idx + 1}
            </span>
          </div>

          <h1 className="mt-6 text-[clamp(2.25rem,5.5vw,3.75rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
            {t(`services.${service.key}Title`)}
          </h1>
          <p className="text-muted mt-6 max-w-2xl text-[17px] leading-[1.75]">{lead}</p>
          {rest.map((p, i) => (
            <p key={i} className="text-muted mt-5 max-w-2xl text-[17px] leading-[1.75]">
              {p}
            </p>
          ))}
        </Reveal>
      </header>

      <section className="border-rule bg-paper-alt border-t py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <RevealGroup
            className="grid gap-5 md:grid-cols-2"
            stagger={0.06}
            style={{ perspective: "1200px" }}
          >
            {service.groups[locale].map((g, gi) => (
              // id = ancla del apartado: los puntos de la home enlazan aquí (/servicios/sistemas#redes).
              // scroll-mt deja sitio a la nav fija; :target resalta la tarjeta a la que se llega.
              <RevealItem key={g.id} id={g.id} className="h-full scroll-mt-24">
                <TiltCard
                  lift
                  className={`${CARD} relative flex flex-col p-7 md:p-8 ${target === g.id ? TARGETED : ""}`}
                  // El borde va en línea: la clase border-rule de CARD pisaría a una utilidad.
                  style={target === g.id ? { ...CARD_BG, borderColor: "var(--accent)" } : CARD_BG}
                >
                  <span
                    className="absolute top-6 right-7 font-mono text-3xl font-medium tracking-tight opacity-[0.1] transition-opacity duration-300 group-hover:opacity-40"
                    style={{ color: "var(--accent)" }}
                    aria-hidden
                  >
                    {String(gi + 1).padStart(2, "0")}
                  </span>
                  <h2
                    className="pr-12 text-[19px] leading-snug font-semibold tracking-tight"
                    style={{ transform: "translateZ(25px)" }}
                  >
                    <span className={TITLE_HOVER}>{g.title}</span>
                  </h2>
                  <ul className="mt-4 flex flex-col gap-3">
                    {g.items.map((item, i) => (
                      <li
                        key={i}
                        className="text-muted flex gap-3 text-[15px] leading-relaxed transition-[transform,color] duration-200 hover:translate-x-1 hover:text-[var(--fg)]"
                      >
                        <Check />
                        <span>
                          <Inline text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                  {g.tools && (
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
                      {g.tools.map((tool) => (
                        <span key={tool} className={CHIP} style={CHIP_STYLE}>
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-rule border-t py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6 md:px-8">
          <Reveal>
            <h2 className="text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em]">
              {t("servicesPage.howTitle")}
            </h2>
            <p className="text-muted mt-5 max-w-xl text-[17px] leading-relaxed">
              {t("servicesPage.howLead")}
            </p>
          </Reveal>

          <RevealGroup
            className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
            stagger={0.07}
            style={{ perspective: "1200px" }}
          >
            {PRINCIPLES[locale].map((p, i) => (
              <RevealItem key={p.title} className="h-full">
                <TiltCard lift className={`${CARD} p-6`} style={CARD_BG}>
                  <span
                    className="inline-block origin-left font-mono text-[11px] transition-transform duration-300 group-hover:scale-[2]"
                    style={{ color: "var(--accent)" }}
                  >
                    0{i + 1}
                  </span>
                  <h3 className="mt-4 text-[17px] font-semibold tracking-tight">
                    <span className={TITLE_HOVER}>{p.title}</span>
                  </h3>
                  <p className="text-muted mt-2 text-[14px] leading-relaxed">{p.text}</p>
                </TiltCard>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="border-rule bg-paper-alt border-t">
        <div className="mx-auto max-w-6xl px-6 py-16 md:px-8 md:py-20">
          <Link href={`/servicios/${other.id}`} className="block" style={{ perspective: "1200px" }}>
            <TiltCard
              lift
              maxTilt={4}
              className={`${CARD} flex flex-col gap-6 p-7 md:flex-row md:items-center md:justify-between md:p-10`}
              style={CARD_BG}
            >
              <span className="flex items-center gap-5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] text-[var(--accent)] transition-[background-color,color,transform] duration-300 group-hover:-rotate-6 group-hover:bg-[var(--accent)] group-hover:text-white">
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
            </TiltCard>
          </Link>
        </div>
      </section>

      <section className="border-rule border-t py-20 md:py-28">
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
