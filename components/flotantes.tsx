"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Los dos nacen ocultos y solo salen al hacer scroll: su código no hace falta para pintar ni para
// hidratar la página. Se descarga con la primera interacción (o si la página ya abre con scroll).
const MobileContactCta = dynamic(() =>
  import("./mobile-contact-cta").then((m) => m.MobileContactCta),
);
const BackToTop = dynamic(() => import("./back-to-top").then((m) => m.BackToTop));

/** Botón "Contactar" del móvil (si `contacto`) y botón de volver arriba, cargados tras la primera interacción. */
export function Flotantes({ contacto = true }: { contacto?: boolean }) {
  const [listo, setListo] = useState(false);
  useEffect(() => {
    if (window.scrollY > 0) {
      setListo(true);
      return;
    }
    const eventos = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
    const activar = () => {
      setListo(true);
      for (const e of eventos) window.removeEventListener(e, activar);
    };
    for (const e of eventos) window.addEventListener(e, activar, { passive: true, once: true });
    return () => {
      for (const e of eventos) window.removeEventListener(e, activar);
    };
  }, []);
  if (!listo) return null;
  return (
    <>
      {contacto && <MobileContactCta />}
      <BackToTop />
    </>
  );
}
