"use client";

import { m } from "framer-motion";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

const ZOOM = { scale: 1.02 };

/**
 * Card con un zoom discreto al pasar el ratón o al tocar (en táctil, whileHover no salta con el
 * dedo y va con whileTap). No sigue al cursor ni se inclina. El reborde naranja lo pone la
 * clase de cada card. Con reduced motion no se anima (lib/motion.tsx).
 */
export function ZoomCard({ children, className, style }: Props) {
  return (
    <m.div
      style={style}
      whileHover={ZOOM}
      whileTap={ZOOM}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className={className}
    >
      {children}
    </m.div>
  );
}
