"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const EASE = [0.23, 1, 0.32, 1] as const;

// Reduced motion: lo resuelve <MotionConfig reducedMotion="user"> (lib/motion.tsx).
// No ramificar initial/animate con useReducedMotion: en SSR vale null y rompe la hidratación.
// La entrada del hero (H1, subtítulo, texto y "Desliza") va en CSS (.hero-rise y .hero-fade
// en globals.css): se pinta con el HTML, sin esperar al JS, y no retrasa el LCP.

function RotatingWord({ words }: { words: string[] }) {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();

  // Con reduced motion la palabra no rota. Se decide en el efecto (solo en cliente),
  // así el HTML del servidor y el primer render del cliente coinciden.
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setI((v) => (v + 1) % words.length), 2600);
    return () => clearInterval(id);
  }, [words.length, reduced]);

  // Los lectores de pantalla leen la lista completa una vez. Sin aria-live: anunciaría
  // una palabra nueva cada 2,6 s sin fin. La animación queda solo para la vista.
  return (
    <>
      <span className="sr-only">{words.join(", ")}</span>
      <span className="relative inline-flex overflow-hidden align-bottom" aria-hidden>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={words[i]}
            className="text-ink inline-block"
            initial={{ y: "60%", opacity: 0, filter: "blur(4px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-60%", opacity: 0, filter: "blur(4px)" }}
            transition={{ duration: 0.28, ease: EASE }}
          >
            {words[i]}
          </motion.span>
        </AnimatePresence>
      </span>
    </>
  );
}

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
  // El parallax va por motion values (no por initial/animate), así que aquí sí hay que
  // mirar reduced motion. Siempre se pasa un motion value para no cambiar el SSR.
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const gridY = useTransform(scrollY, (v) => (reduced ? 0 : Math.min(v, 800) * 0.275));
  const glowY = useTransform(scrollY, (v) => (reduced ? 0 : Math.min(v, 800) * -0.15));

  const words = [t("hero.rot1"), t("hero.rot2"), t("hero.rot3"), t("hero.rot4"), t("hero.rot5")];

  return (
    <section
      id="top"
      className="relative flex min-h-[calc(100svh-72px)] flex-col justify-center overflow-hidden pt-20 pb-24 md:pt-24 md:pb-28"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          y: gridY,
          backgroundImage: "radial-gradient(var(--rule) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, #000 20%, transparent 70%)",
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[620px] w-[620px] rounded-full blur-3xl"
        style={{
          y: glowY,
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--accent) 22%, transparent), transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-8">
        <h1 className="text-[clamp(2.4rem,7.2vw,6.5rem)] leading-[0.95] font-semibold tracking-[-0.045em]">
          <Line delay={0.05}>
            {t("hero.titleStart")} <span className="text-accent">{t("hero.titleAccent1")}</span>,
          </Line>
          <Line delay={0.17}>
            {t("hero.titleMid")} <span className="text-accent">{t("hero.titleAccent2")}</span>.
          </Line>
        </h1>

        <div
          style={{ animationDelay: "0.45s" }}
          className="hero-fade text-muted mt-8 flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[15px] md:text-lg"
        >
          <span style={{ color: "var(--accent)" }} aria-hidden>
            ~/angel $
          </span>
          <RotatingWord words={words} />
          <span
            className="caret -mb-[0.15em] inline-block h-[1.1em] w-[0.55em]"
            style={{ background: "var(--accent)" }}
            aria-hidden
          />
        </div>

        <div className="mt-10">
          <div className="hero-fade" style={{ animationDelay: "0.55s" }}>
            <p className="text-muted max-w-xl text-lg leading-relaxed">{t("hero.lead")}</p>
            <div className="text-muted mt-4 flex items-center gap-2 text-sm">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {t("hero.location")}
            </div>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
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
              <a href="#portfolio" className="btn-secondary">
                {t("hero.ctaSecondary")}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Solo en escritorio, centrado al pie del hero. En móvil ocupaba mucho alto y los
          botones de arriba ya llevan a las secciones. */}
      <a
        href="#about"
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
