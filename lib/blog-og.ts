/**
 * Piezas puras de la imagen social generada (app/blog/[slug]/opengraph-image.tsx). Viven aparte
 * para poder probarlas desde scripts/probar-blog.ts.
 */

/** Texto de la etiqueta "BLOG · CATEGORÍA". */
export const ETIQUETA_CATEGORIA: Record<string, string> = {
  sistemas: "SISTEMAS",
  desarrollo: "DESARROLLO",
  automatizacion: "AUTOMATIZACIÓN",
};

/** Ancho disponible para el título, en píxeles (1200 menos 80 de margen a cada lado). */
export const ANCHO_TITULO = 1040;
export const MAX_LINEAS = 3;
/** Tamaños de letra del título, del mayor al menor. */
export const TAMANOS_TITULO = [64, 58, 52, 46];
/**
 * Ancho medio de un carácter de Space Grotesk Medium, en em, con margen de seguridad (el real es
 * de unos 0,50). Con 0,54 el título de 64 px parte las líneas como las imágenes actuales.
 */
const EM_POR_CARACTER = 0.54;

/** Parte el texto en líneas como lo haría el navegador, usando el ancho medio por carácter. */
export function partirTitulo(texto: string, tamano: number): string[] {
  const maxCaracteres = Math.floor(ANCHO_TITULO / (tamano * EM_POR_CARACTER));
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of texto.split(" ")) {
    const prueba = actual ? `${actual} ${palabra}` : palabra;
    if (prueba.length > maxCaracteres && actual) {
      lineas.push(actual);
      actual = palabra;
    } else {
      actual = prueba;
    }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/**
 * El mayor tamaño con el que el título cabe en 3 líneas. Si ni el menor cabe, se recorta con "…"
 * al final de la tercera línea, así que nunca se corta a medias.
 */
export function ajustarTitulo(titulo: string): { texto: string; tamano: number } {
  for (const tamano of TAMANOS_TITULO) {
    if (partirTitulo(titulo, tamano).length <= MAX_LINEAS) return { texto: titulo, tamano };
  }
  const tamano = TAMANOS_TITULO[TAMANOS_TITULO.length - 1];
  const lineas = partirTitulo(titulo, tamano).slice(0, MAX_LINEAS);
  // La tercera línea son palabras enteras: se le quita la puntuación del final y se pone "…" detrás
  // de la última palabra, sin cortar ninguna a medias.
  let ultima = lineas[MAX_LINEAS - 1].trimEnd();
  while (ultima.length > 1 && ",.;:-".includes(ultima[ultima.length - 1])) {
    ultima = ultima.slice(0, ultima.length - 1);
  }
  lineas[MAX_LINEAS - 1] = `${ultima}…`;
  return { texto: lineas.join(" "), tamano };
}
