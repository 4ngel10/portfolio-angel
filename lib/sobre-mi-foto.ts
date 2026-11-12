/**
 * Variantes del recorte de Ángel para Sobre mí (public/sobre-mi/angel-<ancho>.avif y .webp), generadas
 * con scripts/generar-foto-sobre-mi.ts a partir de public/angel-cutout.webp (520x920, transparente).
 * La lista de anchos la comparten el script y components/about.tsx.
 */
export const ANCHOS_SOBRE_MI = [168, 224, 336, 448, 520] as const;

/** Proporción del recorte (ancho / alto). */
export const RATIO_SOBRE_MI = 520 / 920;

/** srcset de un formato: "/sobre-mi/angel-168.avif 168w, ...". */
export function srcSetSobreMi(ext: "avif" | "webp"): string {
  return ANCHOS_SOBRE_MI.map((w) => `/sobre-mi/angel-${w}.${ext} ${w}w`).join(", ");
}
