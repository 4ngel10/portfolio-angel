/**
 * Reglas del SVG que se sube al blog. Sin dependencias de servidor, para probarlas desde
 * scripts/probar-blog.ts. El SVG nunca se guarda tal cual: tras pasar esta comprobación se
 * convierte a WebP (lib/blog-imagenes.ts), así lo que queda en el bucket es un raster.
 */

/** Ancho al que se rasteriza un SVG, en píxeles (el tope general es 2200). */
export const ANCHO_OBJETIVO_SVG = 1600;
/** sharp renderiza el SVG a 72 ppp por defecto. */
export const DENSIDAD_BASE = 72;
/** Densidad máxima, para que un SVG diminuto no pida un lienzo gigante. */
export const DENSIDAD_MAXIMA = 7200;

/** Cosas que no puede llevar un SVG (se compara en minúsculas). */
const PROHIBIDO_EN_SVG = [
  "<script",
  "javascript:",
  "<foreignobject",
  "<iframe",
  "<embed",
  "<object",
  "data:text/html",
  "<!entity",
  "file:",
  'href="http',
  "href='http",
  "@import",
  "url(http",
  "url('http",
  'url("http',
  "onload",
  "onerror",
  "onclick",
  "onmouseover",
  "onmouseenter",
  "onfocus",
  "onbegin",
  "onend",
  "onrepeat",
  "onanimation",
];
const RAYA_LARGA = String.fromCharCode(0x2014);

/** Motivo por el que un SVG no vale, o null si se puede convertir. */
export function motivoSvgInseguro(texto: string): string | null {
  const bajo = texto.toLowerCase();
  const peligro = PROHIBIDO_EN_SVG.find((p) => bajo.includes(p));
  if (peligro) return `El SVG contiene "${peligro}", que no se admite.`;
  if (texto.includes(RAYA_LARGA)) return "El SVG lleva una raya larga. Usa comas o puntos.";
  return null;
}

/**
 * Densidad con la que renderizar un SVG para que salga a unos 1600 px de ancho. `anchoNatural` es
 * el ancho que sharp lee a 72 ppp.
 */
export function densidadSvg(anchoNatural: number): number {
  if (!(anchoNatural > 0)) return DENSIDAD_BASE;
  const densidad = Math.round((DENSIDAD_BASE * ANCHO_OBJETIVO_SVG) / anchoNatural);
  return Math.min(DENSIDAD_MAXIMA, Math.max(DENSIDAD_BASE, densidad));
}
