import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blog-db";
import { getProyectos } from "@/lib/proyectos-db";
import { construirSitemap } from "@/lib/sitemap-entradas";

// Se regenera cada hora y al publicar desde el panel.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return construirSitemap(await getPublishedPosts(), await getProyectos());
}
