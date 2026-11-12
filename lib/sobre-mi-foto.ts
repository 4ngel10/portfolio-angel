/**
 * Variantes del recorte de Ángel para Sobre mí (public/sobre-mi/angel-<ancho>.avif y .webp), generadas
 * con scripts/generar-foto-sobre-mi.ts a partir de public/angel-cutout.webp (520x1056, transparente).
 * La lista de anchos la comparten el script y components/about.tsx.
 */
export const ANCHOS_SOBRE_MI = [168, 224, 336, 448, 520] as const;

/** Proporción del recorte (ancho / alto). */
export const RATIO_SOBRE_MI = 520 / 1056;

/** srcset de un formato: "/sobre-mi/angel-168.avif 168w, ...". Con `oscuro`, la foto del tema oscuro. */
export function srcSetSobreMi(ext: "avif" | "webp", oscuro = false): string {
  const prefijo = oscuro ? "angel-oscuro" : "angel";
  return ANCHOS_SOBRE_MI.map((w) => `/sobre-mi/${prefijo}-${w}.${ext} ${w}w`).join(", ");
}
