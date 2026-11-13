import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { partesMadrid } from "./blog-db";
import type { Locale } from "./i18n";
import {
  proyectoCard,
  proyectoTieneIngles,
  type ProyectoCard,
  type ProyectoContent,
  type ProyectoPublicado,
  type ProyectoServicio,
} from "./proyectos-types";

/**
 * Lectura de los proyectos del portfolio desde Supabase para la web pública. Mismo patrón que
 * lib/blog-db.ts:
 *
 * - Cliente SIN cookies y con la clave anon: las páginas siguen siendo estáticas. RLS solo deja
 *   pasar los proyectos publicados con fecha ya pasada.
 * - Columnas por nombre, nunca select("*"): anon no puede leer created_by.
 * - Caché de datos con la etiqueta "portfolio" (la invalida lib/proyectos-revalidate.ts) y
 *   `revalidate` de una hora como respaldo, que hace aparecer un proyecto programado a su hora.
 * - Si Supabase falla se lanza una excepción: nunca se devuelve [] por error, porque se cachearía
 *   un portfolio vacío.
 */

export const PORTFOLIO_TAG = "portfolio";
const REVALIDAR_SEGUNDOS = 3600;
const COLUMNAS =
  "id, slug, status, published_at, orden, service, tech, cover, tint, url, image, image_dark, og_image, cover_position, en_servicios, ejemplo, datos_provisionales, content, updated_at";

type Fila = {
  id: string;
  slug: string;
  status: "borrador" | "publicado";
  published_at: string;
  orden: number;
  service: ProyectoServicio;
  tech: string[];
  cover: string;
  tint: number;
  url: string | null;
  image: string | null;
  image_dark: string | null;
  og_image: string | null;
  cover_position: "top" | "center" | null;
  en_servicios: ProyectoServicio[];
  ejemplo: boolean;
  datos_provisionales: boolean;
  content: ProyectoContent;
  updated_at: string;
};

function cliente() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) {
    throw new Error("[proyectos-db] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  return createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } });
}

function iso(fecha: string) {
  const p = partesMadrid(new Date(fecha));
  return `${p.dia}T${p.hora}${p.desfase}`;
}

function aProyecto(f: Fila): ProyectoPublicado {
  return {
    id: f.id,
    slug: f.slug,
    tech: f.tech,
    cover: f.cover,
    tint: f.tint,
    ...(f.url && { url: f.url }),
    ...(f.image && { image: f.image }),
    ...(f.image_dark && { imageDark: f.image_dark }),
    ...(f.cover_position && { coverPosition: f.cover_position }),
    ...(f.og_image && { ogImage: f.og_image }),
    // AAAA-MM-DD de la publicación, en la zona horaria de Madrid.
    date: partesMadrid(new Date(f.published_at)).dia,
    service: f.service,
    orden: f.orden,
    status: f.status,
    publishedAt: iso(f.published_at),
    updatedAt: iso(f.updated_at),
    enServicios: f.en_servicios,
    ejemplo: f.ejemplo,
    datosProvisionales: f.datos_provisionales,
    content: f.content,
  };
}

const leerPublicados = unstable_cache(
  async (): Promise<ProyectoPublicado[]> => {
    const { data, error } = await cliente()
      .from("portfolio_projects")
      .select(COLUMNAS)
      .eq("status", "publicado")
      .order("orden", { ascending: true })
      .order("slug", { ascending: true });
    if (error) throw new Error(`[proyectos-db] ${error.message}`);
    return ((data ?? []) as Fila[]).map(aProyecto);
  },
  ["portfolio-publicados"],
  { tags: [PORTFOLIO_TAG], revalidate: REVALIDAR_SEGUNDOS },
);

/**
 * Proyectos publicados por `orden`. Con `lang` "en" solo salen los que tienen artículo completo en
 * inglés (los únicos que tienen página bajo /en).
 */
export async function getProyectos(lang: Locale = "es"): Promise<ProyectoPublicado[]> {
  const todos = await leerPublicados();
  return lang === "en" ? todos.filter(proyectoTieneIngles) : todos;
}

/** Un proyecto publicado por su slug, o undefined si no existe o no está publicado. */
export async function getProyecto(slug: string): Promise<ProyectoPublicado | undefined> {
  return (await leerPublicados()).find((p) => p.slug === slug);
}

/** Las cards de la home en el idioma de la página. */
export async function getProyectoCards(lang: Locale): Promise<ProyectoCard[]> {
  return (await getProyectos(lang)).map((p) => proyectoCard(p, lang));
}

/** Las cards de los proyectos que se enseñan en la página de un servicio (`en_servicios`). */
export async function getProyectoCardsServicio(
  servicio: ProyectoServicio,
  lang: Locale,
): Promise<ProyectoCard[]> {
  return (await getProyectos(lang))
    .filter((p) => p.enServicios.includes(servicio))
    .map((p) => proyectoCard(p, lang));
}
