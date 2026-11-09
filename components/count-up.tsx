"use client";

import { useEffect, useRef, useState } from "react";

const DURATION = 1400;

/**
 * Cifra que sube rápido de 0 hasta su valor al entrar en pantalla (una sola vez).
 * Acepta el texto ya formateado ("3", "+60", "+1.000", "+1,000"): saca de ahí el prefijo, el
 * número y el separador de miles, y los reaplica en cada fotograma.
 * El HTML del servidor lleva el valor final (sin JS se lee igual). Excepción aprobada por Ángel:
 * se anima también con prefers-reduced-motion (ver CLAUDE.md). Los lectores de pantalla leen
 * siempre el valor final, no los intermedios.
 */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target = Number(value.replace(/\D/g, ""));
    if (!Number.isFinite(target)) return;
    const prefix = value.match(/^\D*/)?.[0] ?? "";
    const sep = value.slice(prefix.length).match(/\D/)?.[0] ?? "";
    const format = (n: number) => prefix + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep);

    let frame = 0;
    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / DURATION, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setShown(format(Math.round(target * eased)));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    // Si ya se ve al montar (p. ej. recarga con el hash #about), no hay que esperar.
    // Si está fuera de pantalla, se parte de 0 para que al llegar se vea subir.
    const rect = el.getBoundingClientRect();
    const visible = rect.top < window.innerHeight * 0.9 && rect.bottom > 0;
    if (visible) {
      run();
      return () => cancelAnimationFrame(frame);
    }
    setShown(format(0));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{value}</span>
      <span aria-hidden className="tabular-nums">
        {shown}
      </span>
    </span>
  );
}
