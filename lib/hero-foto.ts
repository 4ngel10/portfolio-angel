/**
 * Variantes de la foto del hero (public/hero/angel-<ancho>.avif y .webp), generadas con
 * scripts/generar-foto-hero.ts. La lista de anchos la comparten el script y components/hero-photo.tsx.
 */
export const ANCHOS_FOTO = [160, 240, 320, 480, 680, 1020] as const;

/** Proporción de la foto (ancho / alto), recorte vertical 4:5. */
export const RATIO_FOTO = 4 / 5;

/** srcset de un formato: "/hero/angel-160.avif 160w, ...". */
export function srcSetFoto(ext: "avif" | "webp"): string {
  return ANCHOS_FOTO.map((w) => `/hero/angel-${w}.${ext} ${w}w`).join(", ");
}
