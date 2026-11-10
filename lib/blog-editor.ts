/**
 * Forma del artículo en el editor del panel y paso de ida y vuelta al contenido guardado. Sin
 * dependencias de servidor: lo usan el editor (cliente) y las server actions.
 */

import type { BlogContenido } from "../db/schema";
import { bloquesATexto, textoABloques, type TamanoImagen } from "./blog-markup";
import type { BlogPostContent } from "./blog-types";
import type { Locale } from "./i18n";

export type CamposIdioma = {
  title: string;
  seoTitle: string;
  excerpt: string;
  description: string;
  intro: string;
  /** Secciones con marcas (## H2, ### H3, listas, imágenes). La entradilla va aparte. */
  body: string;
};

export type EditorPost = {
  /** null mientras el artículo no está guardado. */
  id: string | null;
  slug: string;
  category: string;
  /** Imagen para redes propia, o vacío para que se genere una. */
  ogImage: string;
  es: CamposIdioma;
  en: CamposIdioma;
};

export const IDIOMAS_EDITOR: readonly Locale[] = ["es", "en"];

export const CAMPOS_VACIOS: CamposIdioma = {
  title: "",
  seoTitle: "",
  excerpt: "",
  description: "",
  intro: "",
  body: "",
};

export function contenidoAEditor(c: BlogPostContent): CamposIdioma {
  return {
    title: c.title ?? "",
    seoTitle: c.seoTitle ?? "",
    excerpt: c.excerpt ?? "",
    description: c.description ?? "",
    intro: c.intro ?? "",
    body: bloquesATexto(c.sections ?? []),
  };
}

export function editorAContenido(
  campos: CamposIdioma,
  conocidas?: Map<string, TamanoImagen>,
): BlogPostContent {
  const seoTitle = campos.seoTitle.trim();
  return {
    title: campos.title.trim(),
    ...(seoTitle ? { seoTitle } : {}),
    excerpt: campos.excerpt.trim(),
    description: campos.description.trim(),
    intro: campos.intro.trim(),
    sections: textoABloques(campos.body, conocidas),
  };
}

export function contenidoDeEditor(
  post: Pick<EditorPost, "es" | "en">,
  conocidas?: Map<string, TamanoImagen>,
): BlogContenido {
  return { es: editorAContenido(post.es, conocidas), en: editorAContenido(post.en, conocidas) };
}

/** Comprobación mínima de la forma de lo que llega del navegador a una server action. */
export function esEditorPost(x: unknown): x is EditorPost {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  const idiomaOk = (v: unknown) => {
    if (typeof v !== "object" || v === null) return false;
    const c = v as Record<string, unknown>;
    return (["title", "seoTitle", "excerpt", "description", "intro", "body"] as const).every(
      (k) => typeof c[k] === "string",
    );
  };
  return (
    (o.id === null || typeof o.id === "string") &&
    typeof o.slug === "string" &&
    typeof o.category === "string" &&
    typeof o.ogImage === "string" &&
    idiomaOk(o.es) &&
    idiomaOk(o.en)
  );
}
