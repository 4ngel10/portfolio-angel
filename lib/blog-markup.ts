/**
 * Conversión entre el cuerpo de un artículo (secciones y bloques de lib/projects.ts) y el texto con
 * marcas que se edita en el panel. Sin pérdidas, y sin expresiones regulares.
 *
 *   ## Título           H2, abre una sección
 *   ### Título          H3
 *   - elemento          lista (una línea por elemento)
 *   1. elemento         lista ordenada
 *   ![alt](ruta "pie")  imagen (el pie es opcional; width y height no se escriben)
 *   línea en blanco     separa los bloques
 *   **negrita** y [enlace](/ruta)   van tal cual dentro del texto
 *
 * La entradilla (`intro`) no va aquí, tiene su propio campo.
 */

import type { PostBlock, PostImage, PostSection } from "./projects";

export type TamanoImagen = { width: number; height: number };

function esImagen(b: PostBlock): b is PostImage {
  return typeof b === "object" && b !== null && "img" in b;
}

function imagenATexto(b: PostImage): string {
  const pie = b.caption ? ` "${b.caption}"` : "";
  return `![${b.alt}](${b.img}${pie})`;
}

function bloqueATexto(b: PostBlock): string {
  if (typeof b === "string") return b;
  if ("h3" in b) return `### ${b.h3}`;
  if ("list" in b) return b.list.map((x) => `- ${x}`).join("\n");
  if ("ol" in b) return b.ol.map((x, i) => `${i + 1}. ${x}`).join("\n");
  return imagenATexto(b);
}

/** Cuerpo del artículo como texto con marcas. */
export function bloquesATexto(sections: PostSection[]): string {
  const partes: string[] = [];
  for (const s of sections) {
    if (s.heading !== undefined) partes.push(`## ${s.heading}`);
    for (const b of s.blocks) partes.push(bloqueATexto(b));
  }
  return partes.join("\n\n");
}

/** Tamaños de las imágenes ya conocidas (por ruta), para no tener que volver a leer el archivo. */
export function imagenesConocidas(sections: PostSection[]): Map<string, TamanoImagen> {
  const mapa = new Map<string, TamanoImagen>();
  for (const s of sections) {
    for (const b of s.blocks) {
      if (esImagen(b) && b.width > 0 && b.height > 0)
        mapa.set(b.img, { width: b.width, height: b.height });
    }
  }
  return mapa;
}

/** Si la línea es `![alt](ruta "pie")`, la imagen; si no, null. Sin tamaño todavía (0 y 0). */
function leerImagen(linea: string, conocidas?: Map<string, TamanoImagen>): PostImage | null {
  if (!linea.startsWith("![") || !linea.endsWith(")")) return null;
  const medio = linea.indexOf("](");
  if (medio < 0) return null;
  const alt = linea.slice(2, medio);
  const resto = linea.slice(medio + 2, linea.length - 1);
  const separador = resto.indexOf(' "');
  let ruta = resto;
  let pie: string | undefined;
  if (separador >= 0) {
    ruta = resto.slice(0, separador);
    const bruto = resto.slice(separador + 2);
    if (!bruto.endsWith('"')) return null;
    pie = bruto.slice(0, bruto.length - 1);
  }
  if (ruta === "" || ruta.includes(" ")) return null;
  const tamano = conocidas?.get(ruta);
  const imagen: PostImage = {
    img: ruta,
    alt,
    width: tamano?.width ?? 0,
    height: tamano?.height ?? 0,
  };
  if (pie !== undefined && pie !== "") imagen.caption = pie;
  return imagen;
}

/** Número de lista ordenada al principio de la línea ("12. texto") o -1. */
function prefijoOrdenada(linea: string): number {
  let i = 0;
  while (i < linea.length && linea[i] >= "0" && linea[i] <= "9") i++;
  if (i === 0 || i > 3) return -1;
  return linea[i] === "." && linea[i + 1] === " " ? i + 2 : -1;
}

/** Texto con marcas a secciones y bloques. `conocidas` da el tamaño de las imágenes que ya existen. */
export function textoABloques(texto: string, conocidas?: Map<string, TamanoImagen>): PostSection[] {
  const secciones: PostSection[] = [];
  let actual: PostSection | null = null;
  let parrafo: string[] = [];
  let lista: { tipo: "list" | "ol"; items: string[] } | null = null;

  const seccion = (): PostSection => {
    if (!actual) {
      actual = { blocks: [] };
      secciones.push(actual);
    }
    return actual;
  };
  const cerrar = () => {
    if (parrafo.length > 0) {
      seccion().blocks.push(parrafo.join("\n"));
      parrafo = [];
    }
    if (lista) {
      seccion().blocks.push(lista.tipo === "list" ? { list: lista.items } : { ol: lista.items });
      lista = null;
    }
  };

  for (const cruda of texto.split("\n")) {
    const linea = cruda.endsWith("\r") ? cruda.slice(0, cruda.length - 1) : cruda;

    if (linea.trim() === "") {
      cerrar();
    } else if (linea.startsWith("## ")) {
      cerrar();
      actual = { heading: linea.slice(3).trim(), blocks: [] };
      secciones.push(actual);
    } else if (linea.startsWith("### ")) {
      cerrar();
      seccion().blocks.push({ h3: linea.slice(4).trim() });
    } else if (linea.startsWith("- ")) {
      if (parrafo.length > 0 || (lista && lista.tipo !== "list")) cerrar();
      lista = lista ?? { tipo: "list", items: [] };
      lista.items.push(linea.slice(2));
    } else if (prefijoOrdenada(linea) > 0) {
      if (parrafo.length > 0 || (lista && lista.tipo !== "ol")) cerrar();
      lista = lista ?? { tipo: "ol", items: [] };
      lista.items.push(linea.slice(prefijoOrdenada(linea)));
    } else {
      const imagen = leerImagen(linea, conocidas);
      if (imagen) {
        cerrar();
        seccion().blocks.push(imagen);
      } else {
        if (lista) cerrar();
        parrafo.push(linea);
      }
    }
  }
  cerrar();
  return secciones;
}
