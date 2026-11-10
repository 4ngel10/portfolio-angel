import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { BlogCategory, BlogPost, BlogPostContent } from "./blog-types";

/**
 * Lectura del blog desde Supabase para la web pública.
 *
 * - Cliente SIN cookies y con la clave anon: así las páginas del blog siguen siendo estáticas
 *   (lib/supabase/server.ts llama a cookies() y las haría dinámicas). RLS solo deja pasar los
 *   artículos publicados con fecha ya pasada.
 * - Se piden las columnas por nombre, nunca select("*"): anon no puede leer created_by.
 * - Caché de datos con la etiqueta "blog" (la invalida lib/blog-revalidate.ts al publicar) y
 *   `revalidate` de una hora como respaldo, que es lo que hace aparecer un artículo programado
 *   cuando llega su hora.
 * - Si Supabase falla se lanza una excepción: nunca se devuelve [] por error, porque se
 *   cachearía un blog vacío. Solo es [] cuando de verdad no hay artículos.
 */

export const BLOG_TAG = "blog";
const REVALIDAR_SEGUNDOS = 3600;
const COLUMNAS =
  "id, slug, category, status, published_at, content, og_image, created_at, updated_at";

type Fila = {
  id: string;
  slug: string;
  category: BlogCategory;
  status: string;
  published_at: string;
  content: { es: BlogPostContent; en: BlogPostContent };
  og_image: string | null;
  created_at: string;
  updated_at: string;
};

function cliente() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) {
    throw new Error("[blog-db] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Partes de una fecha en la zona horaria de Madrid, con el desfase como +01:00 o +02:00. */
function partesMadrid(fecha: Date) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZoneName: "longOffset",
  }).formatToParts(fecha);
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? "";
  const bruto = valor("timeZoneName").replace("GMT", "");
  const signo = bruto.startsWith("-") ? "-" : "+";
  const [horas, minutos = "00"] = bruto.replace("+", "").replace("-", "").split(":");
  return {
    dia: `${valor("year")}-${valor("month")}-${valor("day")}`,
    hora: `${valor("hour")}:${valor("minute")}:${valor("second")}`,
    desfase: `${signo}${(horas || "0").padStart(2, "0")}:${minutos}`,
  };
}

function aPost(fila: Fila): BlogPost {
  const publicado = partesMadrid(new Date(fila.published_at));
  const actualizado = partesMadrid(new Date(fila.updated_at));
  return {
    slug: fila.slug,
    category: fila.category,
    date: publicado.dia,
    publishedAt: `${publicado.dia}T${publicado.hora}${publicado.desfase}`,
    updatedAt: `${actualizado.dia}T${actualizado.hora}${actualizado.desfase}`,
    // Si el artículo no tiene imagen propia, la de la carpeta de su slug (la fase 5 la genera).
    ogImage: fila.og_image ?? `/blog-img/${fila.slug}/og.jpg`,
    post: fila.content,
  };
}

const leerPublicados = unstable_cache(
  async (): Promise<BlogPost[]> => {
    const { data, error } = await cliente()
      .from("blog_posts")
      .select(COLUMNAS)
      .eq("status", "publicado")
      .order("published_at", { ascending: false })
      .order("slug", { ascending: true });
    if (error) throw new Error(`[blog-db] ${error.message}`);
    return ((data ?? []) as Fila[]).map(aPost);
  },
  ["blog-publicados"],
  { tags: [BLOG_TAG], revalidate: REVALIDAR_SEGUNDOS },
);

/** Todos los artículos publicados, del más reciente al más antiguo. */
export async function getPublishedPosts(): Promise<BlogPost[]> {
  return leerPublicados();
}

/** Un artículo publicado por su slug, o undefined si no existe o no está publicado. */
export async function getPublishedPost(slug: string): Promise<BlogPost | undefined> {
  return (await leerPublicados()).find((p) => p.slug === slug);
}

/** Los `n` artículos más recientes. */
export async function getLatestPosts(n: number): Promise<BlogPost[]> {
  return (await leerPublicados()).slice(0, n);
}
