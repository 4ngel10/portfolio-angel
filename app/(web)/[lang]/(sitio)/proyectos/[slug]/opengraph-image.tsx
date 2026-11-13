import { LOCALES } from "@/lib/rutas";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { crearImagenSocial, TAMANO_IMAGEN_SOCIAL } from "@/lib/blog-og-imagen";
import { PORTFOLIO_TAG, getProyecto, getProyectos } from "@/lib/proyectos-db";

/**
 * Imagen para redes de cada proyecto (la plantilla es la del blog, lib/blog-og-imagen.tsx, con el
 * rótulo "PROYECTO · ETIQUETA").
 *
 * Si el proyecto trae su propia `og_image` se sirve esa imagen tal cual desde esta misma ruta: Next
 * da prioridad a este archivo sobre generateMetadata, así que es el único sitio donde puede ganar la
 * imagen propia. Sin `og_image` se genera la imagen con el título en español (seoTitle o título
 * largo) y la etiqueta.
 *
 * Los datos salen de la lectura cacheada de lib/proyectos-db.ts (etiqueta "portfolio") y
 * revalidarPortfolio() también invalida esta ruta. No es dinámica por petición.
 */

export const alt = "Proyecto del portfolio de Ángel Fernández";
export const size = TAMANO_IMAGEN_SOCIAL;
export const contentType = "image/png";
export const revalidate = 3600;

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const lang of LOCALES) {
    for (const p of await getProyectos(lang)) params.push({ lang, slug: p.slug });
  }
  return params;
}

/** La imagen propia del proyecto (og_image), si se puede leer. */
async function leerImagenPropia(ruta: string): Promise<{ bytes: Buffer; tipo: string } | null> {
  try {
    if (ruta.startsWith("/portfolio-img/")) {
      const clave = ruta.slice("/portfolio-img/".length);
      const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!supabase || clave.includes("..")) return null;
      const res = await fetch(`${supabase}/storage/v1/object/public/portfolio/${clave}`, {
        next: { revalidate: 3600, tags: [PORTFOLIO_TAG] },
      });
      if (!res.ok) return null;
      return {
        bytes: Buffer.from(await res.arrayBuffer()),
        tipo: res.headers.get("content-type") ?? "image/jpeg",
      };
    }
    if (ruta.startsWith("/projects/") && !ruta.includes("..")) {
      const base = path.join(process.cwd(), "public", "projects");
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
  const proyecto = await getProyecto(slug);
  if (!proyecto) return new Response("Not found", { status: 404 });

  if (proyecto.ogImage) {
    const propia = await leerImagenPropia(proyecto.ogImage);
    if (propia) {
      return new Response(new Uint8Array(propia.bytes), {
        headers: { "Content-Type": propia.tipo, "Cache-Control": "public, max-age=3600" },
      });
    }
  }

  const es = proyecto.content.es;
  return crearImagenSocial(es.post.seoTitle ?? es.post.title ?? es.title, es.tag, "PROYECTO");
}
