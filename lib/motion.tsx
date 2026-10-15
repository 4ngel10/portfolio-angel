"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
import { installAnchorSmoothScroll } from "./smooth-scroll";

/**
 * Respeta prefers-reduced-motion en todas las animaciones de Framer Motion:
 * anula transforms y layout, y conserva opacidad. Así los componentes no
 * necesitan ramificar con useReducedMotion (que causa hydration mismatch).
 *
 * También instala el scroll suave para los enlaces internos (ver smooth-scroll.ts).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => installAnchorSmoothScroll(), []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
