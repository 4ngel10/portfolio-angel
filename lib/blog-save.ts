import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BlogContenido } from "@/db/schema";
import type { TamanoImagen } from "./blog-markup";

/**
 * Piezas de guardado que comparten el panel (lib/blog-actions.ts) y la API (app/api/blog). Sin
 * "use server": no son acciones, las llama código de servidor ya autorizado.
 */

export const BUCKET_BLOG = "blog";
export const VERSIONES_QUE_SE_CONSERVAN = 20;

/** JSON con las claves ordenadas: jsonb no conserva el orden, así que no se puede comparar a pelo. */
export function canonico(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(",")}]`;
  if (valor && typeof valor === "object") {
    const o = valor as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonico(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(valor) ?? "null";
}

/** La imagen para redes debe ser una ruta propia (/blog-img/ o /blog/). Vacío vale. */
export function ogValido(og: string): boolean {
  return (
    og === "" || ((og.startsWith("/blog-img/") || og.startsWith("/blog/")) && !og.includes(".."))
  );
}

/** Ruta del archivo dentro del bucket para una imagen /blog-img/..., o null si no es de fiar. */
function claveEnBucket(ruta: string): string | null {
  const prefijo = "/blog-img/";
  if (!ruta.startsWith(prefijo)) return null;
  const clave = ruta.slice(prefijo.length);
  if (clave === "" || clave.includes("..") || clave.includes("//") || clave.startsWith("/"))
    return null;
  return clave;
}

/** Lee el archivo de una imagen y devuelve su tamaño, o null si no se puede. */
async function leerTamano(ruta: string): Promise<TamanoImagen | null> {
  try {
    let bytes: Buffer | null = null;
    const clave = claveEnBucket(ruta);
    if (clave) {
      const { data } = await createAdminClient().storage.from(BUCKET_BLOG).download(clave);
      if (data) bytes = Buffer.from(await data.arrayBuffer());
    } else if (ruta.startsWith("/blog/") && !ruta.includes("..")) {
      const base = path.join(process.cwd(), "public", "blog");
      const archivo = path.join(process.cwd(), "public", ruta);
      if (archivo.startsWith(base + path.sep)) bytes = await readFile(archivo);
    }
    if (!bytes) return null;
    const meta = await sharp(bytes).metadata();
    return meta.width && meta.height ? { width: meta.width, height: meta.height } : null;
  } catch {
    return null;
  }
}

/** Rellena width y height de las imágenes nuevas leyendo el archivo subido. */
export async function resolverTamanos(contenido: BlogContenido): Promise<void> {
  const cache = new Map<string, TamanoImagen | null>();
  for (const idioma of ["es", "en"] as const) {
    for (const seccion of contenido[idioma].sections) {
      for (const bloque of seccion.blocks) {
        if (typeof bloque !== "object" || !("img" in bloque) || bloque.width > 0) continue;
        if (!cache.has(bloque.img)) cache.set(bloque.img, await leerTamano(bloque.img));
        const tamano = cache.get(bloque.img);
        if (tamano) {
          bloque.width = tamano.width;
          bloque.height = tamano.height;
        }
      }
    }
  }
}

/** Guarda una copia del contenido y deja solo las últimas 20. `supabase` ya va autorizado. */
export async function guardarVersionCon(
  supabase: SupabaseClient,
  postId: string,
  contenido: BlogContenido,
) {
  const { error } = await supabase
    .from("blog_post_versions")
    .insert({ post_id: postId, content: contenido });
  if (error) {
    console.error("[blog-save] no se pudo guardar la versión", error.message);
    return;
  }
  const { data: viejas } = await supabase
    .from("blog_post_versions")
    .select("id")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })
    .range(VERSIONES_QUE_SE_CONSERVAN, 10_000);
  if (viejas && viejas.length > 0) {
    await supabase
      .from("blog_post_versions")
      .delete()
      .in(
        "id",
        viejas.map((v) => v.id as string),
      );
  }
}
