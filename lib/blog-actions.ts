"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { isUuid } from "@/lib/portal/validate";
import type { BlogContenido } from "@/db/schema";
import type { FilaBlog } from "./blog-admin";
import { contenidoDeEditor, esEditorPost, type EditorPost } from "./blog-editor";
import { imagenesConocidas, type TamanoImagen } from "./blog-markup";
import { revalidarBlog } from "./blog-revalidate";
import { madridLocalAUtc } from "./blog-types";
import { validarPost, type Fallo, type PostParaValidar } from "./blog-validate";

/**
 * Acciones del panel del blog. Todas empiezan con requireAdmin() y validan en el servidor, sin
 * fiarse de lo que valide el navegador. Leen y escriben con la sesión del admin (política
 * admin_all); solo la lectura del tamaño de las imágenes usa el service role, después de
 * requireAdmin().
 */

export type ResultadoBlog = {
  ok: boolean;
  error?: string;
  id?: string;
  slug?: string;
  errores?: Fallo[];
  avisos?: Fallo[];
  /** Publicar: la fecha elegida es futura, queda programado. */
  programado?: boolean;
  publicadoEn?: string;
};

const MAX_BYTES_ENTRADA = 400_000;
const VERSIONES_QUE_SE_CONSERVAN = 20;
const BUCKET = "blog";

/** JSON con las claves ordenadas: jsonb no conserva el orden, así que no se puede comparar a pelo. */
function canonico(valor: unknown): string {
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

function paraValidar(
  fila: Pick<FilaBlog, "slug" | "category" | "og_image" | "content" | "created_by">,
): PostParaValidar {
  return {
    slug: fila.slug,
    category: fila.category,
    ogImage: fila.og_image,
    creadoPor: fila.created_by,
    es: fila.content.es,
    en: fila.content.en,
  };
}

async function cargarFila(id: string): Promise<FilaBlog | null> {
  if (!isUuid(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
  return (data as FilaBlog | null) ?? null;
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
      const { data } = await createAdminClient().storage.from(BUCKET).download(clave);
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
async function resolverTamanos(contenido: BlogContenido): Promise<void> {
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

/** Contenido del editor a contenido guardable, conservando el tamaño de las imágenes que ya había. */
async function construirContenido(
  entrada: EditorPost,
  previa: FilaBlog | null,
): Promise<BlogContenido> {
  const conocidas = new Map<string, TamanoImagen>();
  if (previa) {
    for (const idioma of ["es", "en"] as const) {
      for (const [ruta, tamano] of imagenesConocidas(previa.content[idioma].sections)) {
        conocidas.set(ruta, tamano);
      }
    }
  }
  const contenido = contenidoDeEditor(entrada, conocidas);
  await resolverTamanos(contenido);
  return contenido;
}

function ogValido(og: string): boolean {
  return (
    og === "" || ((og.startsWith("/blog-img/") || og.startsWith("/blog/")) && !og.includes(".."))
  );
}

/** Guarda una copia del contenido y deja solo las últimas 20. */
async function guardarVersion(postId: string, contenido: BlogContenido) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_post_versions")
    .insert({ post_id: postId, content: contenido });
  if (error) {
    console.error("[blog-actions] no se pudo guardar la versión", error.message);
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

/** Crea o actualiza un artículo (siempre como lo envía el editor; no cambia su estado). */
export async function guardarPost(entrada: EditorPost): Promise<ResultadoBlog> {
  const perfil = await requireAdmin();
  const { t } = await getI18n();

  if (!esEditorPost(entrada) || JSON.stringify(entrada).length > MAX_BYTES_ENTRADA) {
    return { ok: false, error: t("blog.err.invalid") };
  }
  if (!ogValido(entrada.ogImage.trim())) return { ok: false, error: t("blog.err.ogInvalid") };

  const previa = entrada.id ? await cargarFila(entrada.id) : null;
  if (entrada.id && !previa) return { ok: false, error: t("blog.err.notFound") };
  if (previa && previa.status === "publicado" && previa.slug !== entrada.slug) {
    return { ok: false, error: t("blog.err.slugLocked") };
  }

  const contenido = await construirContenido(entrada, previa);
  const ogImage = entrada.ogImage.trim() || null;
  const validacion = validarPost(
    {
      slug: entrada.slug,
      category: entrada.category,
      ogImage,
      creadoPor: previa?.created_by,
      es: contenido.es,
      en: contenido.en,
    },
    { publicar: false },
  );
  if (validacion.errores.length > 0) {
    return {
      ok: false,
      error: t("blog.err.fixErrors"),
      errores: validacion.errores,
      avisos: validacion.avisos,
    };
  }

  const supabase = await createClient();
  let id: string;

  if (!previa) {
    const { data, error } = await supabase
      .from("blog_posts")
      .insert({
        slug: entrada.slug,
        category: entrada.category,
        status: "borrador",
        content: contenido,
        og_image: ogImage,
        created_by: perfil.email || perfil.id,
      })
      .select("id")
      .single();
    if (error || !data) {
      return {
        ok: false,
        error: error?.code === "23505" ? t("blog.err.slugTaken") : t("blog.err.saveFailed"),
      };
    }
    id = data.id as string;
    await guardarVersion(id, contenido);
  } else {
    id = previa.id;
    const cambio =
      canonico(previa.content) !== canonico(contenido) ||
      previa.category !== entrada.category ||
      previa.slug !== entrada.slug ||
      (previa.og_image ?? null) !== ogImage;
    const { error } = await supabase
      .from("blog_posts")
      .update({
        slug: entrada.slug,
        category: entrada.category,
        content: contenido,
        og_image: ogImage,
        // updated_at es la fecha que ven buscadores y sitemap: solo se toca si algo cambió.
        ...(cambio ? { updated_at: new Date().toISOString() } : {}),
      })
      .eq("id", id);
    if (error) {
      return {
        ok: false,
        error: error.code === "23505" ? t("blog.err.slugTaken") : t("blog.err.saveFailed"),
      };
    }
    if (canonico(previa.content) !== canonico(contenido)) await guardarVersion(id, contenido);
  }

  revalidarBlog(entrada.slug);
  if (previa && previa.slug !== entrada.slug) revalidarBlog(previa.slug);
  return {
    ok: true,
    id,
    slug: entrada.slug,
    errores: validacion.errores,
    avisos: validacion.avisos,
  };
}

/**
 * Publica un artículo ya guardado. `cuando` es "AAAA-MM-DDTHH:mm" en hora de Madrid; vacío es
 * ahora. Con una fecha futura queda programado: la web lo enseña cuando llega esa hora.
 */
export async function publicarPost(id: string, cuando?: string | null): Promise<ResultadoBlog> {
  await requireAdmin();
  const { t } = await getI18n();

  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("blog.err.notFound") };

  const validacion = validarPost(paraValidar(fila), { publicar: true });
  if (validacion.errores.length > 0) {
    return {
      ok: false,
      error: t("blog.err.fixErrors"),
      errores: validacion.errores,
      avisos: validacion.avisos,
    };
  }

  let fecha = new Date();
  if (cuando && cuando.trim() !== "") {
    const elegida = madridLocalAUtc(cuando.trim());
    if (!elegida) return { ok: false, error: t("blog.err.badDate") };
    fecha = elegida;
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ status: "publicado", published_at: fecha.toISOString() })
    .eq("id", fila.id);
  if (error) return { ok: false, error: t("blog.err.saveFailed") };

  revalidarBlog(fila.slug);
  return {
    ok: true,
    id: fila.id,
    slug: fila.slug,
    avisos: validacion.avisos,
    programado: fecha.getTime() > Date.now(),
    publicadoEn: fecha.toISOString(),
  };
}

export async function despublicarPost(id: string): Promise<ResultadoBlog> {
  await requireAdmin();
  const { t } = await getI18n();
  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("blog.err.notFound") };

  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update({ status: "borrador" })
    .eq("id", fila.id);
  if (error) return { ok: false, error: t("blog.err.saveFailed") };

  revalidarBlog(fila.slug);
  return { ok: true, id: fila.id, slug: fila.slug };
}

/** Copia un artículo como borrador nuevo, con un slug libre (slug-copia, slug-copia-2...). */
export async function duplicarPost(id: string): Promise<ResultadoBlog> {
  const perfil = await requireAdmin();
  const { t } = await getI18n();
  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("blog.err.notFound") };

  const supabase = await createClient();
  const base = `${fila.slug}-copia`.slice(0, 70);
  const { data: existentes } = await supabase
    .from("blog_posts")
    .select("slug")
    .like("slug", `${base}%`);
  const ocupados = new Set((existentes ?? []).map((e) => e.slug as string));
  let slug = base;
  for (let n = 2; ocupados.has(slug); n++) slug = `${base}-${n}`;

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({
      slug,
      category: fila.category,
      status: "borrador",
      content: fila.content,
      og_image: fila.og_image,
      created_by: perfil.email || perfil.id,
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: t("blog.err.saveFailed") };

  await guardarVersion(data.id as string, fila.content);
  revalidarBlog(slug);
  return { ok: true, id: data.id as string, slug };
}

/** Borra un artículo. Un borrador se borra sin más; uno publicado exige escribir su slug. */
export async function borrarPost(id: string, confirmacion?: string): Promise<ResultadoBlog> {
  await requireAdmin();
  const { t } = await getI18n();
  const fila = await cargarFila(id);
  if (!fila) return { ok: false, error: t("blog.err.notFound") };
  if (fila.status === "publicado" && confirmacion !== fila.slug) {
    return { ok: false, error: t("blog.err.confirmSlug") };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", fila.id);
  if (error) return { ok: false, error: t("blog.err.saveFailed") };

  revalidarBlog(fila.slug);
  return { ok: true, slug: fila.slug };
}

/** Vuelve a una versión anterior del contenido. El slug y el estado no cambian. */
export async function restaurarVersion(postId: string, versionId: string): Promise<ResultadoBlog> {
  await requireAdmin();
  const { t } = await getI18n();
  if (!isUuid(versionId)) return { ok: false, error: t("blog.err.notFound") };

  const fila = await cargarFila(postId);
  if (!fila) return { ok: false, error: t("blog.err.notFound") };

  const supabase = await createClient();
  const { data: version } = await supabase
    .from("blog_post_versions")
    .select("content")
    .eq("id", versionId)
    .eq("post_id", fila.id)
    .maybeSingle();
  if (!version) return { ok: false, error: t("blog.err.notFound") };

  const contenido = version.content as BlogContenido;
  const { error } = await supabase
    .from("blog_posts")
    .update({ content: contenido, updated_at: new Date().toISOString() })
    .eq("id", fila.id);
  if (error) return { ok: false, error: t("blog.err.saveFailed") };

  await guardarVersion(fila.id, contenido);
  revalidarBlog(fila.slug);
  return { ok: true, id: fila.id, slug: fila.slug };
}
