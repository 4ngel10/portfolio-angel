import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { BlogContenido } from "@/db/schema";
import { isUuid } from "@/lib/portal/validate";

/**
 * Lectura del blog para el panel /admin/blog. Va con la sesión del admin (rol authenticated y la
 * política admin_all), así que ve también borradores y programados. Nada de service role.
 * Quien llame debe haber pasado antes por requireAdmin().
 */

export type EstadoBlog = "borrador" | "programado" | "publicado";

export type FilaBlog = {
  id: string;
  slug: string;
  category: "sistemas" | "desarrollo" | "automatizacion";
  status: "borrador" | "publicado";
  published_at: string | null;
  content: BlogContenido;
  og_image: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type VersionBlog = { id: string; created_at: string; titulo: string | null };

/** Prefijo de created_by de los borradores que crea la API (fase 4): "api:<nombre del token>". */
export const PREFIJO_API = "api:";

export function estadoDe(
  fila: Pick<FilaBlog, "status" | "published_at">,
  ahora = Date.now(),
): EstadoBlog {
  if (fila.status !== "publicado") return "borrador";
  return fila.published_at && new Date(fila.published_at).getTime() > ahora
    ? "programado"
    : "publicado";
}

export async function listarPostsAdmin(): Promise<FilaBlog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`[blog-admin] ${error.message}`);
  return (data ?? []) as FilaBlog[];
}

export async function obtenerPostAdmin(id: string): Promise<FilaBlog | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`[blog-admin] ${error.message}`);
  return (data as FilaBlog | null) ?? null;
}

export async function listarVersiones(postId: string): Promise<VersionBlog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_post_versions")
    .select("id, created_at, titulo:content->es->>title")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new Error(`[blog-admin] ${error.message}`);
  return (data ?? []) as unknown as VersionBlog[];
}

export type ClaveBlog = {
  id: string;
  nombre: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
};

/** Claves de la API del blog, sin el hash. */
export async function listarClaves(): Promise<ClaveBlog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_api_tokens")
    .select("id, nombre, created_at, last_used_at, revoked_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`[blog-admin] ${error.message}`);
  return (data ?? []) as ClaveBlog[];
}

/** Borradores que ha creado la API y esperan revisión. */
export async function borradoresDeApi(): Promise<FilaBlog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "borrador")
    .like("created_by", `${PREFIJO_API}%`)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`[blog-admin] ${error.message}`);
  return (data ?? []) as FilaBlog[];
}
