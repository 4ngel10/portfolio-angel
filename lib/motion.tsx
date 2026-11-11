"use client";

import { useEffect } from "react";
import { LazyMotion, MotionConfig } from "framer-motion";
import { installAnchorSmoothScroll } from "./smooth-scroll";

// Las funciones de animación se descargan aparte, tras hidratar. Mientras tanto los componentes
// `m.*` se pintan en su estado inicial (el SSR ya los deja así), y el hero no depende de esto.
const cargarFunciones = () => import("./motion-features").then((modulo) => modulo.default);

/**
 * Respeta prefers-reduced-motion en todas las animaciones de Framer Motion:
 * anula transforms y layout, y conserva opacidad. Así los componentes no
 * necesitan ramificar con useReducedMotion (que causa hydration mismatch).
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
