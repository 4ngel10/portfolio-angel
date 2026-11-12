"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, m } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { CONTACT, whatsappUrl } from "@/lib/site";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Botón "Contactar" flotante, en móvil y tablet, por debajo de lg (en escritorio el de la nav siempre se ve).
 * Aparece al dejar atrás el hero, que ya tiene su propio botón, y se esconde cuando la
 * sección de contacto entra en pantalla, para no tapar el formulario ni el footer.
 * Es un enlace a #contact: el scroll suave y el foco los pone lib/smooth-scroll.ts.
 */
export function MobileContactCta() {
  const { t, locale } = useI18n();
  const [visible, setVisible] = useState(false);
  // Fuera de la home no hay sección de contacto: el botón lleva a la de la home.
  const isHome = usePathname() === "/";
  // Atajo de contacto directo (WhatsApp o llamada) solo si hay número en CONTACT.
  const quick = CONTACT.whatsapp
    ? { href: whatsappUrl(locale), label: t("contact.quickContact") }
    : CONTACT.phone
      ? { href: `tel:+${CONTACT.phone}`, label: t("contact.quickCall") }
      : null;

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const contact = document.getElementById("contact");
      const pastHero = window.scrollY > window.innerHeight * 0.8;
      const contactInView = contact
        ? contact.getBoundingClientRect().top < window.innerHeight * 0.9
        : false;
      setVisible(pastHero && !contactInView);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    // El lg:hidden va en un envoltorio: en el propio enlace lo pisa el display de .btn-primary.
    <div className="lg:hidden">
      <AnimatePresence>
        {visible && (
          <m.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.15, ease: EASE } }}
            transition={{ duration: 0.25, ease: EASE }}
            // A la izquierda del botón "volver arriba" (right-5, 48 px), centrado con él.
            className="fixed right-20 bottom-[22px] z-40 flex items-center gap-2"
          >
            {quick && (
              <a
                href={quick.href}
                {...(CONTACT.whatsapp && { target: "_blank", rel: "noopener noreferrer" })}
                aria-label={quick.label}
                className="btn-secondary !h-[44px] !w-[44px] !rounded-full !p-0 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)]"
                style={{ background: "var(--bg)" }}
              >
                {CONTACT.whatsapp ? (
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
                    <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5z" />
                  </svg>
                ) : (
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
                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                  </svg>
                )}
              </a>
            )}
            <a
              href={isHome ? "#contact" : "/#contact"}
              className="btn-primary !px-5 !py-3 !text-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)]"
            >
              {t("nav.ctaContact")}
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
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
