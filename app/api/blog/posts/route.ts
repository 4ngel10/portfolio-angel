import { autenticarApi, respuestaJson } from "@/lib/blog-api-auth";
import { estadoDe, type FilaBlog } from "@/lib/blog-admin";

export const runtime = "nodejs";

type Fila = Pick<FilaBlog, "slug" | "category" | "status" | "published_at" | "updated_at"> & {
  titulo: string | null;
};

/**
 * Lista todos los artículos (slug, título en español, categoría, estado y fechas) para que la
 * rutina no repita temas ni canibalice palabras clave.
 */
export async function GET(request: Request) {
  const sesion = await autenticarApi(request);
  if (sesion instanceof Response) return sesion;

  const { data, error } = await sesion.admin
    .from("blog_posts")
    .select("slug, category, status, published_at, updated_at, titulo:content->es->>title")
    .order("published_at", { ascending: false, nullsFirst: true });
  if (error) return respuestaJson({ error: "unavailable" }, 503);

  const posts = ((data ?? []) as unknown as Fila[]).map((p) => ({
    slug: p.slug,
    title: p.titulo,
    category: p.category,
    status: estadoDe(p),
    published_at: p.published_at,
    updated_at: p.updated_at,
  }));
  return respuestaJson({ posts });
}
