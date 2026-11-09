"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

// Reduced motion: lo resuelve <MotionConfig reducedMotion="user"> (lib/motion.tsx).
// No ramificar initial/animate con useReducedMotion: en SSR vale null y rompe la hidratación.
// La entrada del hero (H1, subtítulo, texto y "Desliza") va en CSS (.hero-rise y .hero-fade
// en globals.css): se pinta con el HTML, sin esperar al JS, y no retrasa el LCP.

/** Línea del H1 que sube desde detrás de una máscara (animación CSS .hero-rise). */
function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      <span className="hero-rise block" style={{ animationDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  );
}

export function Hero() {
  const { t } = useI18n();
  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-72px)] flex-col justify-center overflow-hidden pt-12 pb-16 md:pt-24 md:pb-28"
    >
      <div className="relative mx-auto grid w-full max-w-6xl px-6 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-8">
          <h1 className="text-[clamp(1.9rem,6vw,5.25rem)] leading-[1] font-semibold tracking-[-0.045em] text-balance lg:text-[52px] xl:text-[60px]">
            <Line delay={0.05}>
              {t("hero.title1Pre")}
              <span className="text-accent">{t("hero.title1Accent")}</span>
              {t("hero.title1Post")}
            </Line>
            <Line delay={0.17}>
              {t("hero.title2Pre")}
              <span className="text-accent">{t("hero.title2Accent")}</span>
              {t("hero.title2Post")}
            </Line>
          </h1>

          <div
            style={{ animationDelay: "0.45s" }}
            className="hero-fade text-muted mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[15px] md:mt-8 md:text-lg"
          >
            <span style={{ color: "var(--accent)" }} aria-hidden>
              ~/angel $
            </span>
            <span className="text-ink">{t("hero.terminal")}</span>
            <span
              className="caret -mb-[0.15em] inline-block h-[1.1em] w-[0.55em]"
              style={{ background: "var(--accent)" }}
              aria-hidden
            />
          </div>

          <div className="mt-6 md:mt-10">
            <div className="hero-fade" style={{ animationDelay: "0.55s" }}>
              <p className="text-muted max-w-xl text-lg leading-relaxed">{t("hero.lead")}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-10">
                <a href="#contact" className="btn-primary group">
                  {t("hero.ctaPrimary")}
                  <svg
                    width="16"
                    height="16"
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
                </a>
                <a href="#services" className="btn-secondary">
                  {t("hero.ctaSecondary")}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Foto solo desde lg: en móvil el H1 y los botones tienen que seguir en la primera
            pantalla (allí aparece en Sobre mí). Sin tilt, zoom ni efectos, como las portadas. */}
        <div
          className="hero-fade hidden lg:col-span-4 lg:block"
          style={{ animationDelay: "0.55s" }}
        >
          {/* Foto recortada sin fondo sobre un brillo estático del acento. Sin card ni borde. */}
          <div className="relative ml-auto w-fit">
            <div
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                inset: "8% -10% 0 -10%",
                background:
                  "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 22%, transparent), transparent)",
              }}
            />
            <Image
              src="/angel-cutout.webp"
              alt={t("photo.alt")}
              width={520}
              height={920}
              priority
              sizes="(min-width: 1024px) 280px, 0px"
              className="hero-photo relative h-[470px] w-auto transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-[1.03] xl:h-[520px]"
            />
          </div>
        </div>
      </div>

      {/* Solo en escritorio, centrado al pie del hero. En móvil ocupaba mucho alto y los
          botones de arriba ya llevan a las secciones. */}
      <a
        href="#services"
        style={{ animationDelay: "0.9s" }}
        className="hero-fade text-muted absolute bottom-6 left-1/2 hidden origin-top -translate-x-1/2 flex-col items-center gap-2.5 rounded-xl px-4 py-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-[color,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:scale-110 hover:text-[var(--fg)] active:scale-105 md:flex"
      >
        {t("hero.scroll")}
        <span
          className="relative block h-10 w-px overflow-hidden"
          style={{ background: "var(--rule)" }}
        >
          <motion.span
            className="absolute top-0 left-0 h-1/2 w-px"
            style={{ background: "var(--accent)" }}
            animate={{ y: ["-100%", "200%"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </a>
    </section>
  );
}
