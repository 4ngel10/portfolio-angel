"use client";

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useEffect } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  perspective?: number;
  /** Al pasar el ratón o tocar, además se eleva y crece un poco. Con reduced motion no hace nada. */
  lift?: boolean;
};

/** Tiempo que la card se queda inclinada tras levantar el dedo, para que se vea el efecto. */
const TOUCH_HOLD_MS = 450;

const LIFTED = { y: -6, scale: 1.02 };

/**
 * Tilt 3D. Con ratón sigue al cursor. En táctil, al tocar se inclina hacia el
 * punto tocado y vuelve sola al soltar. Con reduced motion no se inclina.
 */
export function TiltCard({
  children,
  className,
  style,
  maxTilt = 7,
  perspective = 1200,
  lift = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springCfg = { stiffness: 300, damping: 30, mass: 0.5 };
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), springCfg);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), springCfg);

  const tiltTo = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  const releaseTouch = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(reset, TOUCH_HOLD_MS);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={tiltTo}
      onPointerDown={tiltTo}
      onPointerUp={releaseTouch}
      onPointerCancel={releaseTouch}
      onPointerLeave={(e) => (e.pointerType === "mouse" ? reset() : releaseTouch(e))}
      style={{
        ...style,
        rotateX,
        rotateY,
        transformPerspective: perspective,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      // whileHover no salta con el dedo: en táctil la elevación va con whileTap.
      whileHover={lift ? LIFTED : undefined}
      whileTap={lift ? LIFTED : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
