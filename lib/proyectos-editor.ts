/**
 * Forma de un proyecto en el editor del panel y paso de ida y vuelta al contenido guardado. Sin
 * dependencias de servidor: lo usan el editor (cliente) y las server actions. El cuerpo del
 * artículo va como texto con marcas, el mismo que el blog (lib/blog-markup.ts).
 */

import { bloquesATexto, textoABloques, type TamanoImagen } from "./blog-markup";
import type { Locale } from "./i18n";
import type {
  CaseStudy,
  ProyectoContent,
  ProyectoFact,
  ProyectoLocale,
  ProyectoServicio,
} from "./proyectos-types";

export type FilaResultado = { label: string; before: string; after: string };

export type CamposProyectoIdioma = {
  /** Card. */
  title: string;
  tag: string;
  desc: string;
  coverAlt: string;
  /** Artículo. */
  postTitle: string;
  seoTitle: string;
  intro: string;
  /** Secciones con marcas (## H2, ### H3, listas, imágenes). La entradilla va aparte. */
  body: string;
  /** Ficha rápida: 3 filas (las vacías se descartan al guardar). */
  facts: ProyectoFact[];
  /** Resumen del caso. */
  context: string;
  role: string;
  results: FilaResultado[];
  snippetTitle: string;
  snippetCode: string;
  quoteText: string;
  quoteAuthor: string;
  /** Casilla "con permiso del cliente". */
  quotePermiso: boolean;
};

export type EditorProyecto = {
  /** null mientras el proyecto no está guardado. */
  id: string | null;
  slug: string;
  service: string;
  tech: string[];
  /** Texto de la portada cuando no hay imagen. */
  cover: string;
  tint: number;
  url: string;
  image: string;
  imageDark: string;
  /** "" (centro por defecto), "top" o "center". */
  coverPosition: string;
  ogImage: string;
  enServicios: string[];
  ejemplo: boolean;
  datosProvisionales: boolean;
  es: CamposProyectoIdioma;
  en: CamposProyectoIdioma;
};

export const IDIOMAS_EDITOR: readonly Locale[] = ["es", "en"];

export const CAMPOS_PROYECTO_VACIOS: CamposProyectoIdioma = {
  title: "",
  tag: "",
  desc: "",
  coverAlt: "",
  postTitle: "",
  seoTitle: "",
  intro: "",
  body: "",
  facts: [
    { label: "", value: "" },
    { label: "", value: "" },
    { label: "", value: "" },
  ],
  context: "",
  role: "",
  results: [],
  snippetTitle: "",
  snippetCode: "",
  quoteText: "",
  quoteAuthor: "",
  quotePermiso: false,
};

/** Campos de la fila de la tabla que no dependen del idioma, tal como los guarda una versión. */
export type CamposComunes = {
  slug: string;
  service: ProyectoServicio;
  tech: string[];
  cover: string;
  tint: number;
  url: string | null;
  image: string | null;
  imageDark: string | null;
  ogImage: string | null;
  coverPosition: "top" | "center" | null;
  enServicios: ProyectoServicio[];
  ejemplo: boolean;
  datosProvisionales: boolean;
};

/** Lo que se guarda en cada versión: los campos comunes y el contenido por idioma. */
export type VersionProyecto = CamposComunes & { content: ProyectoContent };

export function contenidoAEditor(c: ProyectoLocale): CamposProyectoIdioma {
  const cs = c.caseStudy;
  const facts = [...(c.facts ?? [])];
  while (facts.length < 3) facts.push({ label: "", value: "" });
  return {
    title: c.title ?? "",
    tag: c.tag ?? "",
    desc: c.desc ?? "",
    coverAlt: c.coverAlt ?? "",
    postTitle: c.post?.title ?? "",
    seoTitle: c.post?.seoTitle ?? "",
    intro: c.post?.intro ?? "",
    body: bloquesATexto(c.post?.sections ?? []),
    facts,
    context: cs?.context ?? "",
    role: cs?.role ?? "",
    results: (cs?.results ?? []).map((r) => ({ ...r })),
    snippetTitle: cs?.snippet?.title ?? "",
    snippetCode: cs?.snippet?.code ?? "",
    quoteText: cs?.quote?.text ?? "",
    quoteAuthor: cs?.quote?.author ?? "",
    quotePermiso: cs?.quote?.permiso === true,
  };
}

/** Resumen del caso del editor; undefined si no hay nada escrito. */
function caseStudyDe(c: CamposProyectoIdioma): CaseStudy | undefined {
  const t = (s: string) => s.trim();
  const results = c.results
    .map((r) => ({ label: t(r.label), before: t(r.before), after: t(r.after) }))
    .filter((r) => r.label !== "" || r.before !== "" || r.after !== "");
  const cs: CaseStudy = {};
  if (t(c.context)) cs.context = t(c.context);
  if (t(c.role)) cs.role = t(c.role);
  if (results.length > 0) cs.results = results;
  if (t(c.snippetCode)) {
    cs.snippet = {
      ...(t(c.snippetTitle) ? { title: t(c.snippetTitle) } : {}),
      code: c.snippetCode.trimEnd(),
    };
  }
  if (t(c.quoteText) || t(c.quoteAuthor)) {
    cs.quote = {
      text: t(c.quoteText),
      author: t(c.quoteAuthor),
      ...(c.quotePermiso ? { permiso: true } : {}),
    };
  }
  return Object.keys(cs).length > 0 ? cs : undefined;
}

export function editorAContenido(
  c: CamposProyectoIdioma,
  conocidas?: Map<string, TamanoImagen>,
): ProyectoLocale {
  const t = (s: string) => s.trim();
  const seoTitle = t(c.seoTitle);
  const caseStudy = caseStudyDe(c);
  return {
    title: t(c.title),
    tag: t(c.tag),
    desc: t(c.desc),
    ...(t(c.coverAlt) ? { coverAlt: t(c.coverAlt) } : {}),
    post: {
      ...(t(c.postTitle) ? { title: t(c.postTitle) } : {}),
      ...(seoTitle ? { seoTitle } : {}),
      ...(t(c.intro) ? { intro: t(c.intro) } : {}),
      sections: textoABloques(c.body, conocidas),
    },
    // Las filas vacías se descartan: el validador exige 3 datos completos.
    facts: c.facts
      .map((f) => ({ label: t(f.label), value: t(f.value) }))
      .filter((f) => f.label !== "" || f.value !== ""),
    ...(caseStudy ? { caseStudy } : {}),
  };
}

export function contenidoDeEditor(
  p: Pick<EditorProyecto, "es" | "en">,
  conocidas?: Map<string, TamanoImagen>,
): ProyectoContent {
  return { es: editorAContenido(p.es, conocidas), en: editorAContenido(p.en, conocidas) };
}

const esTexto = (x: unknown): x is string => typeof x === "string";

function idiomaOk(v: unknown): boolean {
  if (typeof v !== "object" || v === null) return false;
  const c = v as Record<string, unknown>;
  const textos = [
    "title",
    "tag",
    "desc",
    "coverAlt",
    "postTitle",
    "seoTitle",
    "intro",
    "body",
    "context",
    "role",
    "snippetTitle",
    "snippetCode",
    "quoteText",
    "quoteAuthor",
  ] as const;
  const fila = (r: unknown, claves: string[]) => {
    if (typeof r !== "object" || r === null) return false;
    const o = r as Record<string, unknown>;
    return claves.every((k) => esTexto(o[k]));
  };
  return (
    textos.every((k) => esTexto(c[k])) &&
    typeof c.quotePermiso === "boolean" &&
    Array.isArray(c.facts) &&
    c.facts.length <= 10 &&
    c.facts.every((f) => fila(f, ["label", "value"])) &&
    Array.isArray(c.results) &&
    c.results.length <= 30 &&
    c.results.every((r) => fila(r, ["label", "before", "after"]))
  );
}

/** Comprobación de la forma de lo que llega del navegador a una server action. */
export function esEditorProyecto(x: unknown): x is EditorProyecto {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    (o.id === null || esTexto(o.id)) &&
    esTexto(o.slug) &&
    esTexto(o.service) &&
    Array.isArray(o.tech) &&
    o.tech.length <= 10 &&
    o.tech.every(esTexto) &&
    esTexto(o.cover) &&
    typeof o.tint === "number" &&
    Number.isInteger(o.tint) &&
    o.tint >= 0 &&
    o.tint <= 100 &&
    esTexto(o.url) &&
    esTexto(o.image) &&
    esTexto(o.imageDark) &&
    esTexto(o.coverPosition) &&
    (o.coverPosition === "" || o.coverPosition === "top" || o.coverPosition === "center") &&
    esTexto(o.ogImage) &&
    Array.isArray(o.enServicios) &&
    o.enServicios.length <= 2 &&
    o.enServicios.every(esTexto) &&
    typeof o.ejemplo === "boolean" &&
    typeof o.datosProvisionales === "boolean" &&
    idiomaOk(o.es) &&
    idiomaOk(o.en)
  );
}
