/**
 * Tipos y utilidades del blog sin dependencias de servidor: los pueden importar los
 * componentes de cliente. La lectura de la base de datos está en lib/blog-db.ts.
 */

import type { Locale } from "./i18n";
import type { PostSection } from "./projects";

export type BlogCategory = "sistemas" | "desarrollo" | "automatizacion";

export type BlogPostContent = {
  title: string;
  /** Título corto para <title> (≤ 42 caracteres + sufijo). Opcional. */
  seoTitle?: string;
  excerpt: string;
  description: string;
  intro: string;
  sections: PostSection[];
};

export type BlogPost = {
  slug: string;
  category: BlogCategory;
  /** AAAA-MM-DD de la publicación, en la zona horaria de Madrid. */
  date: string;
  /** ISO 8601 con el desfase de Madrid (por ejemplo 2026-11-10T09:00:00+01:00). */
  publishedAt: string;
  /** ISO 8601 con el desfase de Madrid. */
  updatedAt: string;
  /** Ruta de la imagen para redes (1200x630), por ejemplo /blog-img/<slug>/og.jpg. */
  ogImage: string;
  post: Record<Locale, BlogPostContent>;
};

/** Lo mínimo para pintar un artículo en un listado, sin el cuerpo (que pesaría en el HTML). */
export type BlogPostSummary = {
  slug: string;
  category: BlogCategory;
  date: string;
  es: { title: string; excerpt: string; minutes: number };
  en: { title: string; excerpt: string; minutes: number };
};

/** Lo justo para un enlace a un artículo (la home): título en los dos idiomas, fecha y categoría. */
export type BlogPostLink = {
  slug: string;
  category: BlogCategory;
  date: string;
  es: { title: string };
  en: { title: string };
};

/** Cuenta palabras sin expresiones regulares: separa por cualquier espacio en blanco. */
function contarPalabras(texto: string): number {
  let palabras = 0;
  let dentro = false;
  for (const caracter of texto) {
    if (caracter.trim() === "") {
      dentro = false;
    } else if (!dentro) {
      dentro = true;
      palabras++;
    }
  }
  return palabras;
}

/** Minutos de lectura aproximados (unas 200 palabras por minuto). */
export function readingMinutes(content: BlogPostContent) {
  const text = [
    content.intro,
    ...content.sections.flatMap((s) => [
      s.heading ?? "",
      ...s.blocks.map((b) =>
        typeof b === "string"
          ? b
          : "list" in b
            ? b.list.join(" ")
            : "ol" in b
              ? b.ol.join(" ")
              : "h3" in b
                ? b.h3
                : "",
      ),
    ]),
  ].join(" ");
  return Math.max(1, Math.round(contarPalabras(text) / 200));
}

export function resumenDe(post: BlogPost): BlogPostSummary {
  const parte = (c: BlogPostContent) => ({
    title: c.title,
    excerpt: c.excerpt,
    minutes: readingMinutes(c),
  });
  return {
    slug: post.slug,
    category: post.category,
    date: post.date,
    es: parte(post.post.es),
    en: parte(post.post.en),
  };
}

export function enlaceDe(post: BlogPost): BlogPostLink {
  return {
    slug: post.slug,
    category: post.category,
    date: post.date,
    es: { title: post.post.es.title },
    en: { title: post.post.en.title },
  };
}

/**
 * Artículo que se propone al final de otro: el siguiente de la misma categoría (en el orden de
 * la lista, dando la vuelta) y, si no hay ninguno, el siguiente de la lista. `posts` va de más
 * reciente a más antiguo. Null si es el único artículo.
 */
export function siguienteDe(posts: BlogPost[], slug: string): BlogPost | null {
  const idx = posts.findIndex((p) => p.slug === slug);
  if (idx < 0) return null;
  const actual = posts[idx];
  const ordenados = [...posts.slice(idx + 1), ...posts.slice(0, idx)];
  return ordenados.find((p) => p.category === actual.category) ?? ordenados[0] ?? null;
}

/** Minutos de desfase de Europe/Madrid en un instante (60 en invierno, 120 en verano). */
function desfaseMadridMin(instante: Date): number {
  const nombre =
    new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Madrid", timeZoneName: "longOffset" })
      .formatToParts(instante)
      .find((p) => p.type === "timeZoneName")?.value ?? "GMT+01:00";
  const bruto = nombre.replace("GMT", "");
  if (bruto === "") return 0;
  const signo = bruto.startsWith("-") ? -1 : 1;
  const [h, m = "0"] = bruto.replace("+", "").replace("-", "").split(":");
  return signo * (Number(h) * 60 + Number(m));
}

/** Instante en UTC como "AAAA-MM-DDTHH:mm" en la hora de Madrid (el valor de un input datetime-local). */
export function utcAMadridLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() + desfaseMadridMin(d) * 60000);
  return local.toISOString().slice(0, 16);
}

/** Lo contrario: "AAAA-MM-DDTHH:mm" en hora de Madrid a un instante. Null si no es una fecha válida. */
export function madridLocalAUtc(local: string): Date | null {
  const [dia, hora] = local.split("T");
  if (!dia || !hora) return null;
  const [a, m, d] = dia.split("-").map(Number);
  const [h, mi] = hora.split(":").map(Number);
  if ([a, m, d, h, mi].some((n) => !Number.isInteger(n))) return null;
  const nominal = Date.UTC(a, m - 1, d, h, mi);
  if (Number.isNaN(nominal)) return null;
  let resultado = new Date(nominal - desfaseMadridMin(new Date(nominal)) * 60000);
  // Cerca de un cambio de hora el primer cálculo puede caer en el desfase equivocado.
  resultado = new Date(nominal - desfaseMadridMin(resultado) * 60000);
  return resultado;
}
