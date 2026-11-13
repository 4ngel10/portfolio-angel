import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DESTINO_PORTFOLIO, leerTamano, VERSIONES_QUE_SE_CONSERVAN } from "./blog-save";
import type { TamanoImagen } from "./blog-markup";
import type { VersionProyecto } from "./proyectos-editor";
import type { ProyectoContent } from "./proyectos-types";

/**
 * Piezas de guardado del panel del portfolio (lib/proyectos-actions.ts). Reutiliza las del blog
 * (lib/blog-save.ts): `canonico` y la lectura del tamaño de las imágenes. Sin "use server".
 */

export { canonico } from "./blog-save";

/** La imagen debe ser una ruta propia (/portfolio-img/ o /projects/). Vacío vale. */
export function rutaValida(ruta: string): boolean {
  return (
    ruta === "" ||
    ((ruta.startsWith("/portfolio-img/") || ruta.startsWith("/projects/")) && !ruta.includes(".."))
  );
}

/** Tamaño conocido de las imágenes de un contenido, por ruta, para no volver a leer el archivo. */
export function imagenesConocidasDe(contenido: ProyectoContent): Map<string, TamanoImagen> {
  const conocidas = new Map<string, TamanoImagen>();
  for (const idioma of ["es", "en"] as const) {
    for (const seccion of contenido[idioma].post?.sections ?? []) {
      for (const bloque of seccion.blocks) {
        if (typeof bloque === "object" && "img" in bloque && bloque.width > 0) {
          conocidas.set(bloque.img, { width: bloque.width, height: bloque.height });
        }
      }
    }
  }
  return conocidas;
}

/** Rellena width y height de las imágenes nuevas leyendo el archivo subido. */
export async function resolverTamanos(contenido: ProyectoContent): Promise<void> {
  const cache = new Map<string, TamanoImagen | null>();
  for (const idioma of ["es", "en"] as const) {
    for (const seccion of contenido[idioma].post.sections) {
      for (const bloque of seccion.blocks) {
        if (typeof bloque !== "object" || !("img" in bloque) || bloque.width > 0) continue;
        if (!cache.has(bloque.img)) {
          cache.set(bloque.img, await leerTamano(bloque.img, DESTINO_PORTFOLIO));
        }
        const tamano = cache.get(bloque.img);
        if (tamano) {
          bloque.width = tamano.width;
          bloque.height = tamano.height;
        }
      }
    }
  }
}

/** Guarda una copia del proyecto y deja solo las últimas 20. `supabase` ya va autorizado. */
export async function guardarVersionCon(
  supabase: SupabaseClient,
  projectId: string,
  version: VersionProyecto,
) {
  const { error } = await supabase
    .from("portfolio_project_versions")
    .insert({ project_id: projectId, content: version });
  if (error) {
    console.error("[proyectos-save] no se pudo guardar la versión", error.message);
    return;
  }
  const { data: viejas } = await supabase
    .from("portfolio_project_versions")
    .select("id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .range(VERSIONES_QUE_SE_CONSERVAN, 10_000);
  if (viejas && viejas.length > 0) {
    await supabase
      .from("portfolio_project_versions")
      .delete()
      .in(
        "id",
        viejas.map((v) => v.id as string),
      );
  }
}
