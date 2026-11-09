"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

/**
 * Botón "Nuevo" de la cabecera del admin: abre un menú con los atajos de alta. Es un botón con
 * aria-expanded; se cierra con Escape (y devuelve el foco al botón), al hacer clic fuera, al
 * elegir una opción o al salir del menú con el teclado.
 */
export function MenuNuevo({
  etiqueta,
  items,
}: {
  etiqueta: string;
  items: { href: string; label: string }[];
}) {
  const id = useId();
  const [abierto, setAbierto] = useState(false);
  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: PointerEvent) => {
      if (!raiz.current?.contains(e.target as Node)) setAbierto(false);
    };
    const tecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    document.addEventListener("pointerdown", fuera);
    document.addEventListener("keydown", tecla);
    return () => {
      document.removeEventListener("pointerdown", fuera);
      document.removeEventListener("keydown", tecla);
    };
  }, [abierto]);

  return (
    <div
      ref={raiz}
      className="relative"
      onBlur={(e) => {
        // Si el foco sale del menú (Tab), se cierra.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setAbierto(false);
      }}
    >
      <button
        ref={boton}
        type="button"
        aria-expanded={abierto}
        aria-controls={id}
        onClick={() => setAbierto((a) => !a)}
        className="btn-primary !px-3.5 !py-2 !text-sm"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {etiqueta}
      </button>
      {abierto ? (
        <ul
          id={id}
          className="border-rule bg-paper absolute top-full right-0 z-50 mt-2 w-52 max-w-[calc(100vw-2rem)] rounded-xl border p-1.5 shadow-lg"
        >
          {items.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                onClick={() => setAbierto(false)}
                className="hover:bg-chip block rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:bg-[var(--chip)]"
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
