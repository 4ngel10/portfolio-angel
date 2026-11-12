/** Entradas del sitemap por URL e idioma. Pura (sin red): app/sitemap.ts le pasa los artículos. */
import type { MetadataRoute } from "next";
import { SITE_URL, LAST_UPDATED } from "@/lib/site";
import { PROJECTS, proyectoTieneIngles } from "@/lib/projects";
import { SERVICES } from "@/lib/services";
import { tieneIngles, type BlogPost } from "@/lib/blog-types";
import { LEGAL_PAGES } from "@/lib/legal";
import { localizedHref, type Lang } from "@/lib/rutas";

type Entrada = MetadataRoute.Sitemap[number];

/** URL absoluta de una ruta en español sin prefijo, en el idioma pedido. */
function url(lang: Lang, ruta: string) {
  const r = localizedHref(lang, ruta);
  return r === "/" ? SITE_URL : `${SITE_URL}${r}`;
}

/**
 * Una entrada por URL e idioma. Cada una lleva `alternates.languages` con las versiones que existen
 * (solo el español si no hay traducción completa), y ninguna URL empieza por /es.
 */
function entradas(
  ruta: string,
  idiomas: readonly Lang[],
  datos: Omit<Entrada, "url" | "alternates">,
): Entrada[] {
  const languages: Record<string, string> = {};
  for (const l of idiomas) languages[l] = url(l, ruta);
  return idiomas.map((l) => ({
    url: url(l, ruta),
    ...datos,
    ...(idiomas.length > 1 && { alternates: { languages } }),
  }));
}

export function construirSitemap(posts: BlogPost[]): MetadataRoute.Sitemap {
  // updatedAt es ISO con desfase y todos llevan el mismo formato, así que compara bien como texto.
  const latestPost = posts.reduce(
    (max, p) => (p.updatedAt > max ? p.updatedAt : max),
    posts[0]?.updatedAt ?? LAST_UPDATED,
  );
  const ambos = ["es", "en"] as const;
  const postsEn = posts.filter(tieneIngles);
  return [
    ...entradas("/", ambos, {
      lastModified: new Date(LAST_UPDATED),
      changeFrequency: "monthly",
      priority: 1,
    }),
    ...SERVICES.flatMap((s) =>
      entradas(`/servicios/${s.id}`, ambos, {
        lastModified: new Date(LAST_UPDATED),
        changeFrequency: "monthly",
        priority: 0.8,
      }),
    ),
    ...PROJECTS.flatMap((p) =>
      entradas(`/proyectos/${p.slug}`, proyectoTieneIngles(p) ? ambos : ["es"], {
        lastModified: new Date(p.date ?? LAST_UPDATED),
        changeFrequency: "monthly",
        priority: 0.7,
      }),
    ),
    ...entradas("/blog", postsEn.length > 0 ? ambos : ["es"], {
      lastModified: new Date(latestPost),
      changeFrequency: "weekly",
      priority: 0.7,
    }),
    ...posts.flatMap((p) =>
      entradas(`/blog/${p.slug}`, tieneIngles(p) ? ambos : ["es"], {
        lastModified: new Date(p.updatedAt),
        changeFrequency: "monthly",
        priority: 0.6,
      }),
    ),
    ...LEGAL_PAGES.flatMap((p) =>
      entradas(`/${p.id}`, ambos, {
        lastModified: new Date(p.updated),
        changeFrequency: "yearly",
        priority: 0.2,
      }),
    ),
  ];
}
