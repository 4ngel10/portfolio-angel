import type { MetadataRoute } from "next";
import { SITE_URL, LAST_UPDATED } from "@/lib/site";
import { PROJECTS } from "@/lib/projects";
import { SERVICES } from "@/lib/services";
import { getPublishedPosts } from "@/lib/blog-db";
import { LEGAL_PAGES } from "@/lib/legal";

// Se regenera cada hora y al publicar desde el panel.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE_URL;
  const posts = await getPublishedPosts();
  // updatedAt es ISO con desfase y todos llevan el mismo formato, así que compara bien como texto.
  const latestPost = posts.reduce(
    (max, p) => (p.updatedAt > max ? p.updatedAt : max),
    posts[0]?.updatedAt ?? LAST_UPDATED,
  );
  return [
    {
      url: base,
      lastModified: new Date(LAST_UPDATED),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...SERVICES.map((s) => ({
      url: `${base}/servicios/${s.id}`,
      lastModified: new Date(LAST_UPDATED),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...PROJECTS.map((p) => ({
      url: `${base}/proyectos/${p.slug}`,
      lastModified: new Date(p.date ?? LAST_UPDATED),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${base}/blog`,
      lastModified: new Date(latestPost),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    },
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...LEGAL_PAGES.map((p) => ({
      url: `${base}/${p.id}`,
      lastModified: new Date(p.updated),
      changeFrequency: "yearly" as const,
      priority: 0.2,
    })),
  ];
}
