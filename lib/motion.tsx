"use client";

import { useEffect } from "react";
import { LazyMotion, MotionConfig, MotionGlobalConfig } from "framer-motion";
import { installAnchorSmoothScroll } from "./smooth-scroll";

// Las funciones de animación se descargan aparte, tras hidratar. Mientras tanto los componentes
// `m.*` se pintan en su estado inicial (el SSR ya los deja así), y el hero no depende de esto.
const cargarFunciones = () => import("./motion-features").then((modulo) => modulo.default);

// Con prefers-reduced-motion: reduce, Framer Motion se salta TODAS sus animaciones (también los
// fundidos de opacidad). MotionConfig reducedMotion="user" solo quita transformaciones y layout, y
// dejaba los fundidos de entrada (450 a 500 ms) y los de los botones flotantes. Va a nivel de módulo
// y no en un efecto: los efectos de los hijos corren antes que los del padre y las primeras
// animaciones ya habrían empezado. No toca el HTML, así que no hay hydration mismatch.
if (typeof window !== "undefined") {
  const reducido = window.matchMedia("(prefers-reduced-motion: reduce)");
  MotionGlobalConfig.skipAnimations = reducido.matches;
  reducido.addEventListener("change", (e) => {
    MotionGlobalConfig.skipAnimations = e.matches;
  });
}

/**
 * Respeta prefers-reduced-motion en todas las animaciones de Framer Motion: las salta enteras
 * (MotionGlobalConfig.skipAnimations, arriba) y MotionConfig reducedMotion="user" queda como
 * segunda red para transforms y layout. Así los componentes no necesitan ramificar con
 * useReducedMotion (que causa hydration mismatch).
 *
 * También instala el scroll suave para los enlaces internos (ver smooth-scroll.ts).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => installAnchorSmoothScroll(), []);

  // strict: si algún componente usa `motion.*` en vez de `m.*` falla en desarrollo, así no se
  // cuela el paquete completo.
  return (
    <LazyMotion features={cargarFunciones} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
