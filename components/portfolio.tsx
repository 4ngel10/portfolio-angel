"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TiltCard } from "./tilt-card";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { ProjectCover } from "./project-cover";
import { useI18n } from "@/lib/i18n";
import { PROJECTS } from "@/lib/projects";

export function Portfolio() {
  const { t, locale } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [update]);

  // Avanza una card: su ancho más el hueco de gap-5 (20px).
  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    const card = el?.firstElementChild?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section id="portfolio" className="bg-paper-alt scroll-mt-[72px] py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <Reveal>
          <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em]">
            {t("portfolio.title")}
          </h2>
          <p className="text-muted mt-5 mb-14 max-w-xl text-[17px] leading-relaxed">
            {t("portfolio.lead")}
          </p>
        </Reveal>

        {/* Una sola fila deslizable: 1 card en móvil, 2 en tablet y 3 en escritorio. El padding
            vertical deja sitio a la sombra y al tilt, que el overflow recortaría. */}
        <div
          ref={trackRef}
          className="-mx-6 snap-x snap-mandatory overflow-x-auto px-6 py-8 [-ms-overflow-style:none] [scrollbar-width:none] md:-mx-8 md:px-8 [&::-webkit-scrollbar]:hidden"
          style={{ scrollPaddingInline: "1.5rem" }}
        >
          <RevealGroup className="flex gap-5" stagger={0.08} style={{ perspective: "1200px" }}>
            {PROJECTS.map((p) => {
              const title = t(`portfolio.${p.key}Title`);
              return (
                <RevealItem
                  key={p.key}
                  className="h-full shrink-0 basis-full snap-start sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-2.5rem)/3)]"
                >
                  {/* Cada card abre la página del proyecto (app/proyectos/[slug]). */}
                  <Link
                    href={`/proyectos/${p.slug}`}
                    className="block h-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
                  >
                    <TiltCard
                      className="group border-rule flex h-full flex-col overflow-hidden rounded-2xl border transition-[box-shadow,border-color] duration-300 hover:border-[var(--accent)] hover:shadow-[0_30px_60px_-25px_rgba(194,65,12,0.3)]"
                      style={{ background: "var(--bg)" }}
                    >
                      <ProjectCover
                        project={p}
                        alt={p.coverAlt?.[locale] ?? title}
                        sizes="(min-width: 1024px) 370px, (min-width: 640px) 50vw, 100vw"
                        className="h-52"
                      />
                      <div
                        className="flex flex-1 flex-col p-6"
                        style={{ transform: "translateZ(20px)" }}
                      >
                        <span
                          className="mb-2 inline-block font-mono text-[11px] font-semibold tracking-wider uppercase"
                          style={{ color: "var(--accent)" }}
                        >
                          {t(`portfolio.${p.key}Tag`)}
                        </span>
                        {/* En hover el título crece y pasa a negrita: invita a abrir el artículo.
                          scale en vez de font-size para no recolocar el resto de la card. */}
                        <h3 className="mb-2 origin-left text-[17px] leading-snug font-semibold tracking-tight transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.06] group-hover:font-bold">
                          {title}
                        </h3>
                        <p className="text-muted mb-4 text-[13px] leading-relaxed">
                          {t(`portfolio.${p.key}Desc`)}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.tech.map((tt) => (
                            <span
                              key={tt}
                              className="rounded px-2 py-0.5 font-mono text-[11px]"
                              style={{ background: "var(--chip)", color: "var(--muted)" }}
                            >
                              {tt}
                            </span>
                          ))}
                        </div>
                        <span className="text-muted mt-auto inline-flex items-center gap-2 self-start pt-5 text-[13px] font-medium transition-colors duration-200 group-hover:text-[var(--accent)]">
                          {t("project.readArticle")}
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform duration-200 group-hover:translate-x-1"
                            aria-hidden
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </span>
                      </div>
                    </TiltCard>
                  </Link>
                </RevealItem>
              );
            })}
          </RevealGroup>
        </div>

        {(canPrev || canNext) && (
          <div className="flex justify-end gap-3">
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => scrollByCard(dir === "next" ? 1 : -1)}
                disabled={dir === "prev" ? !canPrev : !canNext}
                aria-label={t(`portfolio.${dir}`)}
                className="border-rule inline-flex h-11 w-11 items-center justify-center rounded-full border transition-[transform,opacity,border-color,color] duration-200 hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] active:scale-[0.97] disabled:opacity-35 disabled:hover:border-[var(--rule)] disabled:hover:text-inherit"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points={dir === "prev" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
