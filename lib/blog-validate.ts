/**
 * Comprobador de artículos del blog. Lo usan el panel (/admin/blog), las server actions y, en la
 * fase 4, la API. Sin dependencias de servidor, para poder ejecutarlo también en el navegador.
 *
 * Los mensajes van en español: son sobre el contenido (que está en español) y los lee quien edita.
 * OJO con las expresiones regulares: aquí no se usa ninguna con barras invertidas (en Windows se
 * pierden). Todo se hace recorriendo el texto o con `includes`.
 */

import type { Locale } from "./i18n";
import type { PostBlock, PostImage } from "./proyectos-types";
import type { BlogCategory, BlogPostContent } from "./blog-types";

export type Fallo = { ruta: string; mensaje: string };
export type Resultado = { errores: Fallo[]; avisos: Fallo[] };

export type PostParaValidar = {
  slug: string;
  category: string;
  /** Imagen para redes propia; si falta, se genera una (aviso, no error). */
  ogImage?: string | null;
  /** Quién lo creó (created_by). Los artículos migrados ("migracion") no bloquean por el mínimo de imágenes. */
  creadoPor?: string;
  es: BlogPostContent;
  en: BlogPostContent;
};

export const CATEGORIAS: readonly BlogCategory[] = ["sistemas", "desarrollo", "automatizacion"];
export const IDIOMAS: readonly Locale[] = ["es", "en"];

const RAYA_LARGA = String.fromCharCode(0x2014);
const DOS_PUNTOS = String.fromCharCode(0x3a);
const MIN_DESCRIPCION = 120;
const MAX_DESCRIPCION = 155;
const MAX_TITULO = 60;
const MIN_PALABRAS = 900;
const MAX_PALABRAS = 1500;
const ZONA = "Palma de Mallorca";

/** Slug: minúsculas, números y guiones sueltos, sin guion al principio ni al final. */
export function slugValido(slug: string): boolean {
  if (slug.length === 0 || slug.length > 80) return false;
  if (slug.startsWith("-") || slug.endsWith("-") || slug.includes("--")) return false;
  for (const c of slug) {
    const esLetra = c >= "a" && c <= "z";
    const esNumero = c >= "0" && c <= "9";
    if (!esLetra && !esNumero && c !== "-") return false;
  }
  return true;
}

/** Cuenta palabras recorriendo el texto. Separadores, solo espacio, tabulador y saltos de línea. */
export function contarPalabras(texto: string): number {
  let palabras = 0;
  let dentro = false;
  for (let i = 0; i < texto.length; i++) {
    const codigo = texto.charCodeAt(i);
    const separador = codigo === 32 || codigo === 9 || codigo === 10 || codigo === 13;
    if (separador) dentro = false;
    else if (!dentro) {
      dentro = true;
      palabras++;
    }
  }
  return palabras;
}

/** Caracteres reales (un emoji o una letra con tilde cuenta uno). */
function largo(texto: string): number {
  return Array.from(texto).length;
}

function esImagen(b: PostBlock): b is PostImage {
  return typeof b === "object" && b !== null && "img" in b;
}

/** Quita el destino de los enlaces, `[texto](/ruta)` queda como `[texto]`. */
function sinDestinos(texto: string): string {
  let salida = "";
  let i = 0;
  while (i < texto.length) {
    if (texto[i] === "]" && texto[i + 1] === "(") {
      const fin = texto.indexOf(")", i + 2);
      if (fin >= 0) {
        salida += "]";
        i = fin + 1;
        continue;
      }
    }
    salida += texto[i];
    i++;
  }
  return salida;
}

type Texto = { ruta: string; texto: string };

/** Todo el texto visible de un idioma, con la ruta de cada trozo. */
function textosDe(prefijo: string, c: BlogPostContent): Texto[] {
  const salida: Texto[] = [
    { ruta: `${prefijo}.title`, texto: c.title ?? "" },
    { ruta: `${prefijo}.seoTitle`, texto: c.seoTitle ?? "" },
    { ruta: `${prefijo}.excerpt`, texto: c.excerpt ?? "" },
    { ruta: `${prefijo}.description`, texto: c.description ?? "" },
    { ruta: `${prefijo}.intro`, texto: c.intro ?? "" },
  ];
  (c.sections ?? []).forEach((s, i) => {
    salida.push({ ruta: `${prefijo}.sections[${i}].heading`, texto: s.heading ?? "" });
    s.blocks.forEach((b, j) => {
      const ruta = `${prefijo}.sections[${i}].blocks[${j}]`;
      if (typeof b === "string") salida.push({ ruta, texto: b });
      else if ("h3" in b) salida.push({ ruta, texto: b.h3 });
      else if ("list" in b)
        b.list.forEach((x, k) => salida.push({ ruta: `${ruta}.list[${k}]`, texto: x }));
      else if ("ol" in b)
        b.ol.forEach((x, k) => salida.push({ ruta: `${ruta}.ol[${k}]`, texto: x }));
      else if (esImagen(b)) {
        salida.push({ ruta: `${ruta}.alt`, texto: b.alt ?? "" });
        salida.push({ ruta: `${ruta}.caption`, texto: b.caption ?? "" });
      }
    });
  });
  return salida;
}

/** Texto corrido del artículo (entradilla y secciones) para contar palabras. */
function cuerpoDe(c: BlogPostContent): string {
  const trozos: string[] = [c.intro ?? ""];
  for (const s of c.sections ?? []) {
    trozos.push(s.heading ?? "");
    for (const b of s.blocks) {
      if (typeof b === "string") trozos.push(b);
      else if ("h3" in b) trozos.push(b.h3);
      else if ("list" in b) trozos.push(b.list.join(" "));
      else if ("ol" in b) trozos.push(b.ol.join(" "));
    }
  }
  return trozos.join("\n");
}

/** Palabras del artículo (entradilla y cuerpo), para el comprobador y el aviso de longitud. */
export function palabrasDe(c: BlogPostContent): number {
  return contarPalabras(cuerpoDe(c));
}

function imagenesDe(c: BlogPostContent): { img: PostImage; ruta: string }[] {
  const salida: { img: PostImage; ruta: string }[] = [];
  (c.sections ?? []).forEach((s, i) =>
    s.blocks.forEach((b, j) => {
      if (esImagen(b)) salida.push({ img: b, ruta: `sections[${i}].blocks[${j}]` });
    }),
  );
  return salida;
}

/** Párrafos sueltos y elementos de lista, sin contar los destinos de los enlaces. */
function parrafosDe(c: BlogPostContent): { ruta: string; texto: string }[] {
  const salida: { ruta: string; texto: string }[] = [];
  salida.push({ ruta: "intro", texto: c.intro ?? "" });
  (c.sections ?? []).forEach((s, i) =>
    s.blocks.forEach((b, j) => {
      if (typeof b === "string") salida.push({ ruta: `sections[${i}].blocks[${j}]`, texto: b });
    }),
  );
  return salida;
}

/** Hay un guion entre dos números cortos, como "24-48" (las fechas AAAA-MM-DD no cuentan). */
function tieneRangoConGuion(texto: string): boolean {
  const limpio = sinDestinos(texto);
  const esNumero = (c: string | undefined) => c !== undefined && c >= "0" && c <= "9";
  for (let i = 1; i < limpio.length - 1; i++) {
    if (limpio[i] !== "-" || !esNumero(limpio[i - 1]) || !esNumero(limpio[i + 1])) continue;
    let antes = 0;
    while (esNumero(limpio[i - 1 - antes])) antes++;
    let despues = 0;
    while (esNumero(limpio[i + 1 + despues])) despues++;
    if (antes <= 3 && despues <= 3) return true;
  }
  return false;
}

/** Dos puntos de puntuación, seguidos de espacio o al final. Los de "https://" no cuentan. */
function tieneDosPuntos(texto: string): boolean {
  const limpio = sinDestinos(texto);
  for (let i = 0; i < limpio.length; i++) {
    if (limpio[i] === DOS_PUNTOS && (i === limpio.length - 1 || limpio[i + 1] === " ")) return true;
  }
  return false;
}

function contieneZona(texto: string): boolean {
  return texto.toLowerCase().includes(ZONA.toLowerCase());
}

function enlazaA(c: BlogPostContent, destinos: string[]): boolean {
  const todo = textosDe("x", c)
    .map((t) => t.texto)
    .join("\n");
  return destinos.some((d) => todo.includes(`](${d}`));
}

/**
 * Valida un artículo. Con `publicar: true` salen todos los errores (lo que impide publicar). Con
 * `publicar: false` (guardar un borrador) solo bloquean los que impiden guardarlo, el slug, la
 * categoría y el título en español, y el resto sale como avisos.
 */
export function validarPost(post: PostParaValidar, opciones: { publicar: boolean }): Resultado {
  const errores: Fallo[] = [];
  const avisos: Fallo[] = [];
  const bloquea = (f: Fallo, siempre = false) =>
    (opciones.publicar || siempre ? errores : avisos).push(f);

  if (!slugValido(post.slug)) {
    bloquea(
      {
        ruta: "slug",
        mensaje:
          "El slug solo admite minúsculas, números y guiones sueltos, por ejemplo mi-articulo.",
      },
      true,
    );
  }
  if (!(CATEGORIAS as readonly string[]).includes(post.category)) {
    bloquea({ ruta: "category", mensaje: "La categoría no es válida." }, true);
  }
  if ((post.es.title ?? "").trim() === "") {
    bloquea({ ruta: "es.title", mensaje: "Falta el título en español." }, true);
  }

  for (const idioma of IDIOMAS) {
    const c = post[idioma];

    if ((c.title ?? "").trim() === "" && idioma === "en") {
      bloquea({ ruta: "en.title", mensaje: "Falta el título en inglés." });
    }
    if (tieneDosPuntos(c.title ?? "")) {
      bloquea({ ruta: `${idioma}.title`, mensaje: "El título no lleva dos puntos, usa una coma." });
    }
    (c.sections ?? []).forEach((s, i) => {
      if (s.heading && tieneDosPuntos(s.heading)) {
        bloquea({
          ruta: `${idioma}.sections[${i}].heading`,
          mensaje: "Un H2 no lleva dos puntos, usa una coma.",
        });
      }
    });

    // Raya larga en cualquier texto visible.
    for (const t of textosDe(idioma, c)) {
      if (t.texto.includes(RAYA_LARGA)) {
        bloquea({ ruta: t.ruta, mensaje: "Lleva una raya larga. Usa comas o puntos." });
      }
    }

    // Meta description.
    const d = largo((c.description ?? "").trim());
    if (d < MIN_DESCRIPCION || d > MAX_DESCRIPCION) {
      bloquea({
        ruta: `${idioma}.description`,
        mensaje: `La description tiene ${d} caracteres y debe tener de ${MIN_DESCRIPCION} a ${MAX_DESCRIPCION}.`,
      });
    }

    // Título para el buscador.
    const tituloSeo = (c.seoTitle ?? "").trim() || (c.title ?? "").trim();
    if (largo(tituloSeo) > MAX_TITULO) {
      // El <title> sale del español: en inglés solo es un aviso.
      (idioma === "es" ? bloquea : (f: Fallo) => avisos.push(f))({
        ruta: c.seoTitle ? `${idioma}.seoTitle` : `${idioma}.title`,
        mensaje: `El título tiene ${largo(tituloSeo)} caracteres y debe tener ${MAX_TITULO} o menos.`,
      });
    }

    // La zona solo va en la description.
    if (contieneZona(c.title ?? "")) {
      bloquea({ ruta: `${idioma}.title`, mensaje: `"${ZONA}" solo puede ir en la description.` });
    }
    if (contieneZona(c.seoTitle ?? "")) {
      bloquea({
        ruta: `${idioma}.seoTitle`,
        mensaje: `"${ZONA}" solo puede ir en la description.`,
      });
    }
    (c.sections ?? []).forEach((s, i) => {
      if (s.heading && contieneZona(s.heading)) {
        bloquea({
          ruta: `${idioma}.sections[${i}].heading`,
          mensaje: `"${ZONA}" solo puede ir en la description.`,
        });
      }
    });

    // Imágenes.
    const imagenes = imagenesDe(c);
    if (imagenes.length < 2) {
      // Los artículos migrados (created_by "migracion") no siempre tenían imágenes: para ellos es un aviso.
      (post.creadoPor === "migracion" ? (f: Fallo) => avisos.push(f) : bloquea)({
        ruta: `${idioma}.sections`,
        mensaje: `Hacen falta al menos 2 imágenes con alt y hay ${imagenes.length}.`,
      });
    }
    for (const { img, ruta } of imagenes) {
      const r = `${idioma}.${ruta}`;
      if ((img.alt ?? "").trim() === "")
        bloquea({ ruta: `${r}.alt`, mensaje: "La imagen no tiene alt." });
      const src = img.img ?? "";
      if (!src.startsWith("/blog-img/") && !src.startsWith("/blog/")) {
        bloquea({ ruta: `${r}.img`, mensaje: "La imagen debe apuntar a /blog-img/ o a /blog/." });
      }
      if (!(img.width > 0) || !(img.height > 0)) {
        bloquea({ ruta: `${r}.width`, mensaje: "La imagen no tiene width y height." });
      }
    }

    // Enlace interno a un servicio.
    if (!enlazaA(c, ["/servicios/sistemas", "/servicios/web"])) {
      bloquea({
        ruta: `${idioma}.sections`,
        mensaje: "Falta un enlace interno a /servicios/sistemas o /servicios/web.",
      });
    }

    // Avisos.
    const palabras = palabrasDe(c);
    if (palabras < MIN_PALABRAS || palabras > MAX_PALABRAS) {
      avisos.push({
        ruta: `${idioma}.sections`,
        mensaje: `Tiene ${palabras} palabras. Lo habitual es de ${MIN_PALABRAS} a ${MAX_PALABRAS}.`,
      });
    }
    for (const t of textosDe(idioma, c)) {
      if (t.texto && tieneRangoConGuion(t.texto)) {
        avisos.push({ ruta: t.ruta, mensaje: 'Rango con guion, mejor "24 a 48" que "24-48".' });
      }
    }
    for (const p of parrafosDe(c)) {
      if (tieneDosPuntos(p.texto)) {
        avisos.push({ ruta: `${idioma}.${p.ruta}`, mensaje: "Lleva dos puntos en un párrafo." });
      }
    }
    if (!enlazaA(c, ["/blog/", "/proyectos/"])) {
      avisos.push({
        ruta: `${idioma}.sections`,
        mensaje: "Falta un enlace a otro artículo o a un proyecto.",
      });
    }
  }

  // ES y EN tienen que ser paralelos.
  if ((post.es.sections ?? []).length !== (post.en.sections ?? []).length) {
    bloquea({
      ruta: "en.sections",
      mensaje: `Español e inglés tienen distinto número de secciones (${(post.es.sections ?? []).length} y ${(post.en.sections ?? []).length}).`,
    });
  }
  if (imagenesDe(post.es).length !== imagenesDe(post.en).length) {
    bloquea({
      ruta: "en.sections",
      mensaje: `Español e inglés tienen distinto número de imágenes (${imagenesDe(post.es).length} y ${imagenesDe(post.en).length}).`,
    });
  }

  if (!post.ogImage) {
    avisos.push({ ruta: "ogImage", mensaje: "No hay imagen para redes propia, se generará una." });
  }

  return { errores, avisos };
}

const esTexto = (x: unknown): x is string => typeof x === "string";
const esListaTextos = (x: unknown): x is string[] => Array.isArray(x) && x.every(esTexto);

/**
 * Comprueba la forma de un contenido que llega de fuera (la API) y devuelve una copia limpia, solo
 * con las claves conocidas. Las imágenes pueden venir sin width y height (se leen del archivo al
 * guardar). Si algo no encaja, devuelve los fallos por ruta.
 */
export function normalizarContenido(
  entrada: unknown,
  prefijo: string,
): { contenido: BlogPostContent } | { errores: Fallo[] } {
  const errores: Fallo[] = [];
  const falla = (ruta: string, mensaje: string) =>
    errores.push({ ruta: `${prefijo}.${ruta}`, mensaje });
  if (typeof entrada !== "object" || entrada === null || Array.isArray(entrada)) {
    return { errores: [{ ruta: prefijo, mensaje: "Tiene que ser un objeto." }] };
  }
  const o = entrada as Record<string, unknown>;
  for (const campo of ["title", "excerpt", "description", "intro"] as const) {
    if (!esTexto(o[campo])) falla(campo, "Tiene que ser un texto.");
  }
  if (o.seoTitle !== undefined && !esTexto(o.seoTitle))
    falla("seoTitle", "Tiene que ser un texto.");
  if (!Array.isArray(o.sections) || o.sections.length === 0 || o.sections.length > 60) {
    falla("sections", "Tiene que ser una lista de 1 a 60 secciones.");
    return { errores };
  }

  const sections: BlogPostContent["sections"] = [];
  o.sections.forEach((s: unknown, i: number) => {
    const ruta = `sections[${i}]`;
    if (typeof s !== "object" || s === null || Array.isArray(s))
      return falla(ruta, "Tiene que ser un objeto.");
    const sec = s as Record<string, unknown>;
    if (sec.heading !== undefined && !esTexto(sec.heading))
      falla(`${ruta}.heading`, "Tiene que ser un texto.");
    if (!Array.isArray(sec.blocks) || sec.blocks.length > 200) {
      return falla(`${ruta}.blocks`, "Tiene que ser una lista de bloques.");
    }
    const blocks: PostBlock[] = [];
    sec.blocks.forEach((b: unknown, j: number) => {
      const r = `${ruta}.blocks[${j}]`;
      if (esTexto(b)) return void blocks.push(b);
      if (typeof b !== "object" || b === null || Array.isArray(b))
        return falla(r, "Bloque no válido.");
      const bl = b as Record<string, unknown>;
      if (esTexto(bl.h3)) return void blocks.push({ h3: bl.h3 });
      if (esListaTextos(bl.list)) return void blocks.push({ list: bl.list });
      if (esListaTextos(bl.ol)) return void blocks.push({ ol: bl.ol });
      if (esTexto(bl.img) && esTexto(bl.alt)) {
        const num = (v: unknown) =>
          typeof v === "number" && Number.isFinite(v) && v > 0 ? Math.round(v) : 0;
        const imagen: PostImage = {
          img: bl.img,
          alt: bl.alt,
          width: num(bl.width),
          height: num(bl.height),
        };
        if (esTexto(bl.caption) && bl.caption !== "") imagen.caption = bl.caption;
        return void blocks.push(imagen);
      }
      falla(r, "Bloque no válido, usa un texto, h3, list, ol o img con alt.");
    });
    sections.push({ ...(esTexto(sec.heading) ? { heading: sec.heading } : {}), blocks });
  });
  if (errores.length > 0) return { errores };

  return {
    contenido: {
      title: (o.title as string).trim(),
      ...(esTexto(o.seoTitle) && o.seoTitle.trim() ? { seoTitle: o.seoTitle.trim() } : {}),
      excerpt: (o.excerpt as string).trim(),
      description: (o.description as string).trim(),
      intro: (o.intro as string).trim(),
      sections,
    },
  };
}
