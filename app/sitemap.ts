import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { PROJECTS } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL;
  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    ...PROJECTS.map((p) => ({
      url: `${base}/proyectos/${p.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
