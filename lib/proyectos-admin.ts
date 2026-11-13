import "server-only";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/portal/validate";
import { partesMadrid } from "./blog-db";
import type { CamposComunes, VersionProyecto } from "./proyectos-editor";
import type { Proyecto, ProyectoContent, ProyectoServicio } from "./proyectos-types";
import type { ProyectoParaValidar } from "./proyectos-validate";

/**
 * Tipos y ayudas del panel /admin/portfolio. La fila se lee con la sesión del admin (rol
 * authenticated y la política admin_all), así que incluye borradores y programados. Nada de
 * service role. Quien las use debe haber pasado antes por requireAdmin().
 */

export type EstadoProyecto = "borrador" | "programado" | "publicado";

export type FilaProyecto = {
  id: string;
  slug: string;
  status: "borrador" | "publicado";
  published_at: string | null;
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
  created_by: string;
  created_at: string;
  updated_at: string;
};

export function estadoDe(
  fila: Pick<FilaProyecto, "status" | "published_at">,
  ahora = Date.now(),
): EstadoProyecto {
  if (fila.status !== "publicado") return "borrador";
  return fila.published_at && new Date(fila.published_at).getTime() > ahora
    ? "programado"
    : "publicado";
}

/** Campos comunes de una fila, como los guarda una versión. */
export function comunesDe(fila: FilaProyecto): CamposComunes {
  return {
    slug: fila.slug,
    service: fila.service,
    tech: fila.tech,
    cover: fila.cover,
    tint: fila.tint,
    url: fila.url,
    image: fila.image,
    imageDark: fila.image_dark,
    ogImage: fila.og_image,
    coverPosition: fila.cover_position,
    enServicios: fila.en_servicios,
    ejemplo: fila.ejemplo,
    datosProvisionales: fila.datos_provisionales,
  };
}

export function versionDe(fila: FilaProyecto): VersionProyecto {
  return { ...comunesDe(fila), content: fila.content };
}

/** Fila a lo que entiende el comprobador. `date` es el día de publicación (AAAA-MM-DD). */
export function paraValidar(
  fila: Pick<
    FilaProyecto,
    | "slug"
    | "service"
    | "tech"
    | "en_servicios"
    | "image"
    | "image_dark"
    | "og_image"
    | "ejemplo"
    | "datos_provisionales"
    | "content"
  >,
  date?: string,
): ProyectoParaValidar {
  return {
    slug: fila.slug,
    service: fila.service,
    date,
    tech: fila.tech,
    enServicios: fila.en_servicios,
    image: fila.image,
    imageDark: fila.image_dark,
    ogImage: fila.og_image,
    ejemplo: fila.ejemplo,
    datosProvisionales: fila.datos_provisionales,
    es: fila.content.es,
    en: fila.content.en,
  };
}

export type VersionListada = { id: string; created_at: string; titulo: string | null };

/** Todos los proyectos por `orden`, también borradores y programados. */
export async function listarProyectosAdmin(): Promise<FilaProyecto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .order("orden", { ascending: true })
    .order("slug", { ascending: true });
  if (error) throw new Error(`[proyectos-admin] ${error.message}`);
  return (data ?? []) as FilaProyecto[];
}

export async function obtenerProyectoAdmin(id: string): Promise<FilaProyecto | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`[proyectos-admin] ${error.message}`);
  return (data as FilaProyecto | null) ?? null;
}

export async function listarVersionesProyecto(projectId: string): Promise<VersionListada[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("portfolio_project_versions")
    .select("id, created_at, titulo:content->content->es->>title")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(`[proyectos-admin] ${error.message}`);
  return (data ?? []) as unknown as VersionListada[];
}

/** Lo que pide acción en el Resumen: borradores y proyectos publicados con cifras provisionales. */
export async function proyectosPendientes(): Promise<{
  borradores: FilaProyecto[];
  provisionales: FilaProyecto[];
}> {
  const filas = await listarProyectosAdmin();
  const ahora = Date.now();
  return {
    borradores: filas.filter((f) => f.status === "borrador"),
    provisionales: filas.filter((f) => f.datos_provisionales && estadoDe(f, ahora) !== "borrador"),
  };
}

/** Una fila como `Proyecto`, para la vista previa con los componentes reales de la web. */
export function filaAProyecto(fila: FilaProyecto): Proyecto {
  const publicado = fila.published_at ?? new Date().toISOString();
  return {
    id: fila.id,
    slug: fila.slug,
    tech: fila.tech,
    cover: fila.cover,
    tint: fila.tint,
    ...(fila.url && { url: fila.url }),
    ...(fila.image && { image: fila.image }),
    ...(fila.image_dark && { imageDark: fila.image_dark }),
    ...(fila.cover_position && { coverPosition: fila.cover_position }),
    ...(fila.og_image && { ogImage: fila.og_image }),
    date: partesMadrid(new Date(publicado)).dia,
    service: fila.service,
    orden: fila.orden,
    status: fila.status,
    publishedAt: fila.published_at,
    updatedAt: fila.updated_at,
    enServicios: fila.en_servicios,
    ejemplo: fila.ejemplo,
    datosProvisionales: fila.datos_provisionales,
    content: fila.content,
  };
}
