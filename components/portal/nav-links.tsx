"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Pestañas de sección: la activa lleva un borde inferior de 2px en el acento. Si no caben,
 * la fila hace scroll horizontal (sin barra visible) y la pestaña activa se centra al cargar.
 */
export function NavLinks({
  items,
  label,
}: {
  items: { href: string; label: string; exact?: boolean }[];
  label: string;
}) {
  const pathname = usePathname();
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = nav.current;
    const activa = el?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!el || !activa) return;
    el.scrollLeft = activa.offsetLeft - (el.clientWidth - activa.offsetWidth) / 2;
  }, [pathname]);

  return (
    <nav
      ref={nav}
      aria-label={label}
      className="-ml-3 flex gap-1 overflow-x-auto whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((it) => {
        const activo = it.exact ? pathname === it.href : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={activo ? "page" : undefined}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-offset-[-2px] ${
              activo
                ? "text-ink border-[var(--accent)]"
                : "text-muted hover:text-ink border-transparent"
            }`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
