import { LOCALES } from "@/lib/rutas";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getPublishedPost, getPublishedPosts } from "@/lib/blog-db";
import { tieneIngles } from "@/lib/blog-types";
import { crearImagenSocial, TAMANO_IMAGEN_SOCIAL } from "@/lib/blog-og-imagen";

/**
 * Imagen para redes de cada artículo (la plantilla está en lib/blog-og-imagen.tsx).
 *
 * Si el artículo trae su propia `og_image` (los cinco migrados la tienen) se sirve esa imagen tal
 * cual desde esta misma ruta: Next da prioridad a este archivo sobre generateMetadata, así que es
 * el único sitio donde puede ganar la imagen propia. Sin `og_image` se genera la imagen con el
 * título en español (seoTitle o title) y la categoría.
 *
 * Los datos salen de la lectura cacheada de lib/blog-db.ts (etiqueta "blog"), y revalidarBlog()
 * también invalida esta ruta.
 */

export const alt = "Artículo del blog de Ángel Fernández";
export const size = TAMANO_IMAGEN_SOCIAL;
export const contentType = "image/png";
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return LOCALES.flatMap((lang) =>
    posts.filter((p) => lang === "es" || tieneIngles(p)).map((p) => ({ lang, slug: p.slug })),
  );
}

/** La imagen propia del artículo (og_image), si se puede leer. */
async function leerImagenPropia(ruta: string): Promise<{ bytes: Buffer; tipo: string } | null> {
  try {
    if (ruta.startsWith("/blog-img/")) {
      const clave = ruta.slice("/blog-img/".length);
      const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabase || clave.includes("..")) return null;
      const res = await fetch(`${supabase}/storage/v1/object/public/blog/${clave}`, {
        next: { revalidate: 3600, tags: ["blog"] },
      });
      if (!res.ok) return null;
      return {
        bytes: Buffer.from(await res.arrayBuffer()),
        tipo: res.headers.get("content-type") ?? "image/jpeg",
      };
    }
    if (ruta.startsWith("/blog/") && !ruta.includes("..")) {
      const base = path.join(process.cwd(), "public", "blog");
      const archivo = path.join(process.cwd(), "public", ruta);
      if (!archivo.startsWith(base + path.sep)) return null;
      const tipo = archivo.endsWith(".png")
        ? "image/png"
        : archivo.endsWith(".webp")
          ? "image/webp"
          : "image/jpeg";
      return { bytes: await readFile(archivo), tipo };
    }
  } catch {
    return null;
  }
  return null;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return new Response("Not found", { status: 404 });

  if (post.ogImage) {
    const propia = await leerImagenPropia(post.ogImage);
    if (propia) {
      return new Response(new Uint8Array(propia.bytes), {
        headers: { "Content-Type": propia.tipo, "Cache-Control": "public, max-age=3600" },
      });
    }
  }

  const es = post.post.es;
  return crearImagenSocial(es.seoTitle ?? es.title, post.category);
}
