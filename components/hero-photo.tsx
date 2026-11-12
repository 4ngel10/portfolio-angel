"use client";

import { useI18n } from "@/lib/i18n";
import { srcSetFoto } from "@/lib/hero-foto";
import { srcSetFotoMovil } from "@/lib/hero-foto-movil";

// Pixel transparente: es el `src` del <img> cuando ningún <source> aplica. Así cada bloque (móvil y
// escritorio, uno de los dos siempre oculto) solo descarga su foto y el oculto no pide nada.
const VACIA = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const PANTALLA = {
  escritorio: "(min-width: 1024px)",
  movil: "(max-width: 1023.98px)",
} as const;

/**
 * Foto del hero entera (recorte vertical 4:5), con esquinas redondeadas de 16 px y el mismo borde
 * interior que las portadas. Sin halo ni brillo.
 *
 * Prioridad (decisión de Ángel): en escritorio la foto es el LCP, así que carga con prioridad alta;
 * en móvil también va con prioridad alta: desde la foto apaisada es el LCP (con prioridad baja el retraso de carga era de 1 s);
 * los <source> con `media` evitan que el bloque oculto descargue nada.
 * Variantes AVIF y WebP en public/hero (scripts/generar-foto-hero.ts, lib/hero-foto.ts).
 */
export function HeroPhoto({ variante }: { variante: keyof typeof PANTALLA }) {
  const { t } = useI18n();
  const escritorio = variante === "escritorio";
  const media = PANTALLA[variante];
  // Tamaño real en pantalla: 340 px como máximo en escritorio; en móvil y tablet la foto es apaisada
  // (3:2, lib/hero-foto-movil.ts) a todo el ancho con un tope de 448 px.
  const sizes = escritorio ? "340px" : "(min-width: 496px) 448px, calc(100vw - 48px)";
  const srcSet = escritorio ? srcSetFoto : srcSetFotoMovil;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl ${
        escritorio ? "ml-auto w-full max-w-[340px]" : "mx-auto w-full max-w-[448px]"
      }`}
      style={{ aspectRatio: escritorio ? "4 / 5" : "3 / 2" }}
    >
      <picture>
        <source media={media} type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
        <source media={media} type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
        <img
          src={VACIA}
          alt={t("photo.alt")}
          width={escritorio ? 680 : 840}
          height={escritorio ? 850 : 560}
          fetchPriority="high"
          loading={escritorio ? undefined : "eager"}
          decoding={escritorio ? undefined : "sync"}
          className="hero-photo block h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.03]"
        />
      </picture>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-[var(--rule)] ring-inset"
      />
    </div>
  );
}
