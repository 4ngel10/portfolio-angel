"use client";

import { useI18n } from "@/lib/i18n";
import { CONTACT } from "@/lib/site";
import { ProofStrip } from "./proof-strip";
import { HeroPhoto } from "./hero-photo";

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
      className="relative flex flex-col justify-start overflow-hidden pt-10 pb-16 md:pt-16 md:pb-20 lg:justify-center lg:pt-14 lg:pb-16"
    >
      <div className="relative mx-auto grid w-full max-w-6xl px-6 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-8">
          <h1 className="text-[clamp(1.9rem,6vw,5.25rem)] leading-[1] font-semibold tracking-[-0.045em] text-balance lg:text-[52px] xl:text-[60px]">
            <Line delay={0.05}>
              {t("hero.title1Pre")}
              <span className="text-accent">{t("hero.title1Accent")}</span>
              {t("hero.title1Mid")}
              <span className="text-accent">{t("hero.title1Accent2")}</span>
              {t("hero.title1Post")}
            </Line>
            <Line delay={0.17}>{t("hero.title2")}</Line>
          </h1>

          {/* Foto en móvil y tablet, entre el título y el párrafo. Prioridad baja: el LCP debe
              seguir siendo el párrafo y la foto no compite con él (ver hero-photo.tsx). */}
          <div className="hero-fade mt-6 mb-2 lg:hidden">
            <HeroPhoto variante="movil" />
          </div>

          <div className="mt-6 md:mt-10">
            <div>
              <p className="text-muted max-w-xl text-lg leading-relaxed">{t("hero.lead")}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row md:mt-10">
                <a
                  href={CONTACT.bookingUrl || "#contact"}
                  {...(CONTACT.bookingUrl && { target: "_blank", rel: "noopener noreferrer" })}
                  className="btn-primary group"
                >
                  {CONTACT.bookingUrl ? t("hero.ctaBooking") : t("hero.ctaPrimary")}
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
                {/* Con reserva activa, el formulario pasa a ser la vía secundaria. */}
                {CONTACT.bookingUrl ? (
                  <a href="#contact" className="btn-secondary">
                    {t("hero.ctaPrimary")}
                  </a>
                ) : (
                  <a href="#services" className="btn-secondary">
                    {t("hero.ctaSecondary")}
                  </a>
                )}
              </div>
              <ProofStrip />
            </div>
          </div>
        </div>

        {/* Foto de escritorio (desde lg), con prioridad alta: es el LCP. Sin tilt ni halo. */}
        <div
          className="hero-fade hidden lg:col-span-4 lg:block"
          style={{ animationDelay: "0.15s" }}
        >
          <HeroPhoto variante="escritorio" />
        </div>
      </div>
    </section>
  );
}
