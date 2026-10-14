"use client";

import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useRef, useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  perspective?: number;
};

export function TiltCard({ children, className, style, maxTilt = 7, perspective = 1200 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springCfg = { stiffness: 300, damping: 30, mass: 0.5 };
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), springCfg);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), springCfg);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || !fine) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      style={{
        ...style,
        rotateX: reduced || !fine ? 0 : rotateX,
        rotateY: reduced || !fine ? 0 : rotateY,
        transformPerspective: perspective,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
