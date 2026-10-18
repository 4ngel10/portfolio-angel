"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * Botón "Contactar" flotante, solo en móvil (en escritorio el de la nav siempre se ve).
 * Aparece al dejar atrás el hero, que ya tiene su propio botón, y se esconde cuando la
 * sección de contacto entra en pantalla, para no tapar el formulario ni el footer.
 * Es un enlace a #contact: el scroll suave y el foco los pone lib/smooth-scroll.ts.
 */
export function MobileContactCta() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);
  // Fuera de la home no hay sección de contacto: el botón lleva a la de la home.
  const isHome = usePathname() === "/";

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
    // El md:hidden va en un envoltorio: en el propio enlace lo pisa el display de .btn-primary.
    <div className="md:hidden">
      <AnimatePresence>
        {visible && (
          <motion.a
            href={isHome ? "#contact" : "/#contact"}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16, transition: { duration: 0.15, ease: EASE } }}
            transition={{ duration: 0.25, ease: EASE }}
            // A la izquierda del botón "volver arriba" (right-5, 48 px), centrado con él.
            className="btn-primary fixed right-20 bottom-[22px] z-40 !px-5 !py-3 !text-sm shadow-[0_10px_30px_-10px_rgba(0,0,0,0.45)]"
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
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}
