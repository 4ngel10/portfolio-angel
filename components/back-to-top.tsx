"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { focusTarget, smoothScrollTo } from "@/lib/smooth-scroll";

/** Píxeles de scroll a partir de los que aparece el botón. */
const SHOW_AFTER = 600;

/** Botón flotante abajo a la derecha que vuelve al inicio de la página. */
export function BackToTop() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label={t("footer.backTop")}
          onClick={() => {
            smoothScrollTo(0);
            // El botón desaparece arriba: el foco pasa al contenido para no perderse.
            const main = document.getElementById("main");
            if (main) focusTarget(main);
          }}
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.9,
            y: 12,
            transition: { duration: 0.15, ease: [0.23, 1, 0.32, 1] },
          }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="fixed right-5 bottom-5 z-40 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-[0_10px_30px_-10px_rgba(194,65,12,0.6)] transition-transform duration-150 hover:-translate-y-1 active:scale-[0.97] md:right-8 md:bottom-8"
          style={{ background: "var(--accent)" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
