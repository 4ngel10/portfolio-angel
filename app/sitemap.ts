import type { MetadataRoute } from "next";
import { SITE_URL, LAST_UPDATED } from "@/lib/site";
import { PROJECTS } from "@/lib/projects";
import { SERVICES } from "@/lib/services";
import { BLOG_POSTS } from "@/lib/blog";
import { LEGAL_PAGES } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  const latestPost = BLOG_POSTS.reduce(
    (max, p) => (p.date > max ? p.date : max),
    BLOG_POSTS[0]?.date ?? LAST_UPDATED,
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
    ...BLOG_POSTS.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.date),
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
