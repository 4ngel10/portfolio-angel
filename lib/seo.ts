/**
 * SEO: descripciones de metadata y datos estructurados (JSON-LD, schema.org), en español e inglés.
 *
 * Los JSON-LD se pintan con <JsonLd> (components/json-ld.tsx) desde cada page.tsx.
 * El español vive en la ruta sin prefijo y el inglés bajo /en (lib/rutas.ts).
 *
 * hreflang (alternatesFor): cada página declara su propio canonical y, solo con los idiomas que
 * existen de verdad para ella, "es", "en" y "x-default" (el español). Español e inglés se apuntan
 * entre sí (reciprocidad obligatoria, o Google ignora los hreflang). Un artículo o proyecto sin
 * traducción completa al inglés no tiene página en /en: devuelve 404 y no entra en el sitemap.
 */

import { LEGAL, SITE_URL } from "./site";
import { CERTIFICATIONS } from "./certifications";
import type { ProyectoPublicado } from "./proyectos-types";
import type { ServiceDetail as Service } from "./services";
import type { BlogPost } from "./blog-types";
import { LOCALES, localizedHref, type Lang } from "./rutas";
import es from "@/messages/es.json";
import en from "@/messages/en.json";

const MSG = { es, en };

/** Títulos de la home (tope de 60 caracteres). Sin marca: va en SITE_NAME (og:site_name y WebSite). */
export const HOME_TITLES: Record<Lang, string> = {
  es: "Informático para empresas y autónomos en Mallorca",
  en: "IT support and web development in Mallorca",
};
export const HOME_DESCRIPTIONS: Record<Lang, string> = {
  es: "Administrador de sistemas en un equipo que lleva más de 60 hoteles, y desarrollador web para autónomos y pymes. En Palma de Mallorca y en remoto.",
  en: "Systems administrator on a team that looks after 60+ hotels, and web developer for freelancers and small businesses. In Palma de Mallorca and remote.",
};
/** Versión en español, la que usan las pruebas y los textos que aún no distinguen idioma. */
export const HOME_TITLE = HOME_TITLES.es;
export const HOME_DESCRIPTION = HOME_DESCRIPTIONS.es;
/** Nombre del sitio, para og:site_name y el WebSite del JSON-LD (no el título largo de la home). */
export const SITE_NAME = "Ángel Fernández";
/** Imagen para redes de la home (1200x630), la misma en los dos idiomas. */
export const HOME_OG_IMAGE = "/og-home.jpg";

/** Valor de `openGraph.locale` por idioma. */
export const OG_LOCALE: Record<Lang, string> = { es: "es_ES", en: "en_US" };

/**
 * Canonical + hreflang de una página. `path` es la ruta en español sin prefijo (`/servicios/web`);
 * `idiomas` son los que existen para ella (por defecto los dos). Las rutas son relativas a
 * metadataBase.
 */
export function alternatesFor(path: string, lang: Lang = "es", idiomas: readonly Lang[] = LOCALES) {
  const existentes = idiomas.includes(lang) ? idiomas : [...idiomas, lang];
  const languages: Record<string, string> = {};
  for (const l of existentes) languages[l] = localizedHref(l, path);
  languages["x-default"] = localizedHref(existentes.includes("es") ? "es" : existentes[0], path);
  return { canonical: localizedHref(lang, path), languages };
}

/** Meta description de cada página de servicio, por idioma e id. */
export const SERVICE_DESCRIPTIONS: Record<Lang, Record<string, string>> = {
  es: {
    sistemas:
      "Soporte informático y sistemas para empresas en Palma y Mallorca. Copias de seguridad, Microsoft 365, redes y servidores. Remoto o presencial.",
    web: "Diseño y desarrollo web a medida en Palma y Mallorca para autónomos y pymes. Webs rápidas y optimizadas para SEO, con dominio, hosting y mantenimiento.",
  },
  en: {
    sistemas:
      "IT support and systems for businesses in Palma and Mallorca. Backups, Microsoft 365, networks and servers. Remote or on site.",
    web: "Custom web design and development in Palma and Mallorca for freelancers and small businesses. Fast, SEO ready websites with domain, hosting and maintenance.",
  },
};

/** Título SEO de cada página de servicio (sin marca; el <title> añade " · Ángel Fernández"). */
export const SERVICE_TITLES: Record<Lang, Record<string, string>> = {
  es: {
    sistemas: "Soporte informático en Palma y Mallorca",
    web: "Diseño web en Palma y Mallorca",
  },
  en: {
    sistemas: "IT support in Palma and Mallorca",
    web: "Web design in Palma and Mallorca",
  },
};

const PERSON_ID = `${SITE_URL}/#person`;
const BUSINESS_ID = `${SITE_URL}/#business`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON_NAME = "Ángel Fernández Garriga";

/** Referencia al Person de la home, para author y provider en el resto de páginas. */
const personRef = { "@type": "Person", "@id": PERSON_ID, name: PERSON_NAME, url: SITE_URL };

/** URL absoluta de una ruta en español sin prefijo, en el idioma pedido. */
function abs(lang: Lang, path: string) {
  const ruta = localizedHref(lang, path);
  return ruta === "/" ? SITE_URL : `${SITE_URL}${ruta}`;
}

type Crumb = { name: string; path: string };

function breadcrumb(lang: Lang, items: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: abs(lang, c.path),
    })),
  };
}

function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

const MIGAS = {
  es: { inicio: "Inicio", servicios: "Servicios", proyectos: "Proyectos", blog: "Blog" },
  en: { inicio: "Home", servicios: "Services", proyectos: "Projects", blog: "Blog" },
} as const;

/** Home: WebSite + ProfessionalService + Person. Mismas @id en los dos idiomas. */
export function homeJsonLd(lang: Lang = "es") {
  const descripcion = HOME_DESCRIPTIONS[lang];
  const url = abs(lang, "/");
  const region = lang === "en" ? "Balearic Islands" : "Islas Baleares";
  return graph(
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      alternateName: PERSON_NAME,
      url,
      description: descripcion,
      inLanguage: lang,
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "ProfessionalService",
      "@id": BUSINESS_ID,
      name: PERSON_NAME,
      description: descripcion,
      url,
      email: LEGAL.email,
      image: `${SITE_URL}${HOME_OG_IMAGE}`,
      founder: { "@id": PERSON_ID },
      areaServed: { "@type": "City", name: "Palma de Mallorca" },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Palma de Mallorca",
        addressRegion: region,
        addressCountry: "ES",
      },
      sameAs: ["https://www.linkedin.com/in/angelfernandezgarriga", "https://github.com/4ngel10"],
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: PERSON_NAME,
      jobTitle:
        lang === "en"
          ? ["Systems Administrator", "Web Developer"]
          : ["Administrador de Sistemas", "Desarrollador Web"],
      url,
      image: `${SITE_URL}/angel-square.webp`,
      email: LEGAL.email,
      sameAs: ["https://www.linkedin.com/in/angelfernandezgarriga", "https://github.com/4ngel10"],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Palma de Mallorca",
        addressRegion: region,
        addressCountry: "ES",
      },
      // Solo nombre y emisor, como en la tira del hero (lib/certifications.ts).
      hasCredential: CERTIFICATIONS.map((c) => ({
        "@type": "EducationalOccupationalCredential",
        name: c.name,
        recognizedBy: { "@type": "Organization", name: c.issuer },
      })),
      // El stack principal, el mismo que enseña "Sobre mí" (components/about.tsx).
      knowsAbout: [
        "Windows Server",
        "Active Directory",
        "PowerShell",
        "Microsoft 365",
        "Azure",
        "Hyper-V",
        "VMware",
        "Proxmox",
        "Docker",
        "Fortinet",
        "pfSense",
        "Nakivo",
        "Veeam",
        "Intune",
        "Next.js",
        "TypeScript",
        "Shopify",
        "Google Ads",
      ],
    },
  );
}

/** Página de servicio: Service + FAQPage + BreadcrumbList (Inicio > Servicios > servicio). */
export function serviceJsonLd(service: Service, lang: Lang = "es") {
  const name = (MSG[lang].services as Record<string, string>)[`${service.key}Title`];
  const path = `/servicios/${service.id}`;
  const m = MIGAS[lang];
  return graph(
    {
      "@type": "Service",
      "@id": `${SITE_URL}${path}#service`,
      name,
      serviceType: name,
      description: SERVICE_DESCRIPTIONS[lang][service.id],
      url: abs(lang, path),
      inLanguage: lang,
      provider: { "@id": BUSINESS_ID },
      areaServed: { "@type": "City", name: "Palma de Mallorca" },
    },
    ...(service.faq
      ? [
          {
            "@type": "FAQPage",
            "@id": `${SITE_URL}${path}#faq`,
            inLanguage: lang,
            mainEntity: service.faq[lang].items.map((it) => ({
              "@type": "Question",
              name: it.q,
              acceptedAnswer: { "@type": "Answer", text: it.a },
            })),
          },
        ]
      : []),
    // "Servicios" y "Proyectos" no tienen página propia: apuntan a su sección de la home.
    breadcrumb(lang, [
      { name: m.inicio, path: "/" },
      { name: m.servicios, path: "/#services" },
      { name, path },
    ]),
  );
}

/** Página de proyecto: Article + BreadcrumbList (Inicio > Proyectos > proyecto). */
export function projectJsonLd(project: ProyectoPublicado, lang: Lang = "es") {
  const { title: name, desc, post } = project.content[lang];
  const path = `/proyectos/${project.slug}`;
  const url = abs(lang, path);
  const m = MIGAS[lang];
  return graph(
    {
      "@type": "Article",
      "@id": `${SITE_URL}${path}#article`,
      headline: post.title ?? name,
      description: desc,
      url,
      mainEntityOfPage: url,
      inLanguage: lang,
      datePublished: project.publishedAt,
      dateModified: project.updatedAt,
      image: `${SITE_URL}${project.ogImage ?? `/proyectos/${project.slug}/opengraph-image`}`,
      author: personRef,
      publisher: personRef,
    },
    breadcrumb(lang, [
      { name: m.inicio, path: "/" },
      { name: m.proyectos, path: "/#portfolio" },
      { name, path },
    ]),
  );
}

export const BLOG_TITLES: Record<Lang, string> = {
  es: "Blog de sistemas y desarrollo web · Ángel Fernández",
  en: "Systems and web development blog · Ángel Fernández",
};
export const BLOG_DESCRIPTIONS: Record<Lang, string> = {
  es: "Guías prácticas de sistemas, copias de seguridad, desarrollo web con Next.js y automatización, para autónomos y pymes.",
  en: "Practical guides on systems, backups, web development with Next.js and automation, for freelancers and small businesses.",
};
export const BLOG_TITLE = BLOG_TITLES.es;
export const BLOG_DESCRIPTION = BLOG_DESCRIPTIONS.es;

/** Listado del blog: Blog (con sus artículos) + BreadcrumbList (Inicio > Blog). */
export function blogIndexJsonLd(posts: BlogPost[], lang: Lang = "es") {
  const m = MIGAS[lang];
  return graph(
    {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog#blog`,
      name: BLOG_TITLES[lang],
      description: BLOG_DESCRIPTIONS[lang],
      url: abs(lang, "/blog"),
      inLanguage: lang,
      author: personRef,
      blogPost: posts.map((p) => ({
        "@type": "BlogPosting",
        headline: p.post[lang].title,
        url: abs(lang, `/blog/${p.slug}`),
        datePublished: p.publishedAt,
      })),
    },
    breadcrumb(lang, [
      { name: m.inicio, path: "/" },
      { name: m.blog, path: "/blog" },
    ]),
  );
}

/** Artículo del blog: BlogPosting + BreadcrumbList (Inicio > Blog > artículo). */
export function blogPostJsonLd(post: BlogPost, lang: Lang = "es") {
  const content = post.post[lang];
  const path = `/blog/${post.slug}`;
  const url = abs(lang, path);
  const m = MIGAS[lang];
  return graph(
    {
      "@type": "BlogPosting",
      "@id": `${SITE_URL}${path}#article`,
      headline: content.title,
      description: content.description,
      url,
      mainEntityOfPage: url,
      inLanguage: lang,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      // La propia del artículo o, si no tiene, la generada por código (misma en los dos idiomas).
      image: `${SITE_URL}${post.ogImage ?? `/blog/${post.slug}/opengraph-image`}`,
      author: personRef,
      publisher: personRef,
      isPartOf: { "@id": `${SITE_URL}/blog#blog` },
    },
    breadcrumb(lang, [
      { name: m.inicio, path: "/" },
      { name: m.blog, path: "/blog" },
      { name: content.title, path },
    ]),
  );
}
