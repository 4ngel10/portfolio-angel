/**
 * Variantes de la foto del hero solo para móvil y tablet (public/hero-movil/angel-<ancho>.avif y .webp),
 * generadas con scripts/generar-foto-hero-movil.ts. En escritorio se sigue usando lib/hero-foto.ts.
 */
export const ANCHOS_FOTO_MOVIL = [360, 560, 840] as const;

/** Proporción de la foto móvil (ancho / alto), apaisada 3:2. */
export const RATIO_FOTO_MOVIL = 3 / 2;

export function srcSetFotoMovil(ext: "avif" | "webp"): string {
  return ANCHOS_FOTO_MOVIL.map((w) => `/hero-movil/angel-${w}.${ext} ${w}w`).join(", ");
}
