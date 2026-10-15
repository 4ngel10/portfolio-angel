"use client";

import { motion, type Variants } from "framer-motion";

// Reduced motion lo gestiona <MotionConfig reducedMotion="user"> en MotionProvider:
// anula los transforms y conserva los fades. No ramificar aquí con useReducedMotion,
// porque en SSR devuelve null y provoca hydration mismatch.

const EASE = [0.23, 1, 0.32, 1] as const;
const VIEWPORT = { once: true, margin: "0px 0px -10% 0px" } as const;

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
};

/** Fade-up al entrar en viewport. */
export function Reveal({ children, className, delay = 0, y = 24 }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.5, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Contenedor que escalona la entrada de sus RevealItem. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
  as = "div",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul";
  style?: React.CSSProperties;
}) {
  const Comp = as === "ul" ? motion.ul : motion.div;
  return (
    <Comp
      className={className}
      style={style}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Comp>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export function RevealItem({
  children,
  className,
  as = "div",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "span";
  style?: React.CSSProperties;
}) {
  const Comp = as === "li" ? motion.li : as === "span" ? motion.span : motion.div;
  return (
    <Comp className={className} style={style} variants={itemVariants}>
      {children}
    </Comp>
  );
}
