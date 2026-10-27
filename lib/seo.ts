/**
 * SEO: descripciones de metadata y datos estructurados (JSON-LD, schema.org).
 *
 * Los JSON-LD se pintan con <JsonLd> (components/json-ld.tsx) desde cada page.tsx.
 * Todo en español, que es el idioma que reciben los buscadores (el inglés se elige
 * en el navegador sobre la misma URL).
 *
 * hreflang: cada página se declara a sí misma como "es" y "x-default" (alternatesFor).
 * Sin hreflang "en" a propósito (decisión de Ángel): no hay una URL que sirva el inglés, y
 * un "en" hacia la página en español es un error. Por lo mismo no hay og:locale:alternate.
 * Si algún día hay rutas /en/..., se añaden aquí.
 */

import { LEGAL, SITE_URL } from "./site";
import type { Project } from "./projects";
import type { ServiceDetail as Service } from "./services";
import { BLOG_POSTS, type BlogPost } from "./blog";
import es from "@/messages/es.json";

export const HOME_TITLE = "Ángel Fernández · Sistemas y desarrollo web en Mallorca";
/** Imagen para redes de la home (1200x630). */
export const HOME_OG_IMAGE = "/og-home.jpg";
export const HOME_DESCRIPTION =
  "Administrador de sistemas y desarrollador web freelance en Palma de Mallorca. Infraestructura IT segura, backups, redes y webs a medida para empresas.";

/** Canonical + hreflang de una página (ruta relativa a metadataBase). */
export function alternatesFor(path: string) {
  return { canonical: path, languages: { es: path, "x-default": path } };
}

/** Meta description de cada página de servicio, por id. */
export const SERVICE_DESCRIPTIONS: Record<string, string> = {
  sistemas:
    "Administración de sistemas en Palma de Mallorca: servidores Windows, virtualización, backup con Nakivo y Veeam, redes Fortinet y Microsoft 365.",
  web: "Desarrollo web profesional en Palma de Mallorca. Webs corporativas, portfolios y aplicaciones a medida con Next.js. Rápidas, responsive y optimizadas para SEO.",
};

const PERSON_ID = `${SITE_URL}/#person`;
const BUSINESS_ID = `${SITE_URL}/#business`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON_NAME = "Ángel Fernández Garriga";

/** Referencia al Person de la home, para author y provider en el resto de páginas. */
const personRef = { "@type": "Person", "@id": PERSON_ID, name: PERSON_NAME, url: SITE_URL };

type Crumb = { name: string; path: string };

function breadcrumb(items: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE_URL}${c.path}`,
    })),
  };
}

function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

/** Home: WebSite + Person. */
export function homeJsonLd() {
  return graph(
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: HOME_TITLE,
      url: SITE_URL,
      description: HOME_DESCRIPTION,
      inLanguage: ["es", "en"],
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "ProfessionalService",
      "@id": BUSINESS_ID,
      name: PERSON_NAME,
      description: HOME_DESCRIPTION,
      url: SITE_URL,
      email: LEGAL.email,
      image: `${SITE_URL}${HOME_OG_IMAGE}`,
      founder: { "@id": PERSON_ID },
      areaServed: { "@type": "City", name: "Palma de Mallorca" },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Palma de Mallorca",
        addressRegion: "Islas Baleares",
        addressCountry: "ES",
      },
      sameAs: ["https://www.linkedin.com/in/angelfernandezgarriga", "https://github.com/4ngel10"],
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: PERSON_NAME,
      jobTitle: ["Administrador de Sistemas", "Desarrollador Web"],
      url: SITE_URL,
      email: LEGAL.email,
      sameAs: ["https://www.linkedin.com/in/angelfernandezgarriga", "https://github.com/4ngel10"],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Palma de Mallorca",
        addressRegion: "Islas Baleares",
        addressCountry: "ES",
      },
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

/** Página de servicio: Service + BreadcrumbList (Inicio > Servicios > servicio). */
export function serviceJsonLd(service: Service) {
  const name = (es.services as Record<string, string>)[`${service.key}Title`];
  const path = `/servicios/${service.id}`;
  return graph(
    {
      "@type": "Service",
      "@id": `${SITE_URL}${path}#service`,
      name,
      serviceType: name,
      description: SERVICE_DESCRIPTIONS[service.id],
      url: `${SITE_URL}${path}`,
      provider: { "@id": BUSINESS_ID },
      areaServed: { "@type": "City", name: "Palma de Mallorca" },
    },
    // "Servicios" y "Proyectos" no tienen página propia: apuntan a su sección de la home.
    breadcrumb([
      { name: "Inicio", path: "/" },
      { name: "Servicios", path: "/#services" },
      { name, path },
    ]),
  );
}

/** Página de proyecto: Article + BreadcrumbList (Inicio > Proyectos > proyecto). */
export function projectJsonLd(project: Project) {
  const portfolio = es.portfolio as Record<string, string>;
  const name = portfolio[`${project.key}Title`];
  const path = `/proyectos/${project.slug}`;
  return graph(
    {
      "@type": "Article",
      "@id": `${SITE_URL}${path}#article`,
      headline: project.post.es.title ?? name,
      description: portfolio[`${project.key}Desc`],
      url: `${SITE_URL}${path}`,
      mainEntityOfPage: `${SITE_URL}${path}`,
      inLanguage: "es",
      ...(project.date && { datePublished: project.date, dateModified: project.date }),
      ...(project.ogImage && { image: `${SITE_URL}${project.ogImage}` }),
      author: personRef,
      publisher: personRef,
    },
    breadcrumb([
      { name: "Inicio", path: "/" },
      { name: "Proyectos", path: "/#portfolio" },
      { name, path },
    ]),
  );
}

export const BLOG_TITLE = "Blog · Ángel Fernández";
export const BLOG_DESCRIPTION =
  "Artículos sobre administración de sistemas, backup, desarrollo web con Next.js y automatización. Guías prácticas desde Palma de Mallorca.";

/** Listado del blog: Blog (con sus artículos) + BreadcrumbList (Inicio > Blog). */
export function blogIndexJsonLd() {
  return graph(
    {
      "@type": "Blog",
      "@id": `${SITE_URL}/blog#blog`,
      name: BLOG_TITLE,
      description: BLOG_DESCRIPTION,
      url: `${SITE_URL}/blog`,
      inLanguage: "es",
      author: personRef,
      blogPost: BLOG_POSTS.map((p) => ({
        "@type": "BlogPosting",
        headline: p.post.es.title,
        url: `${SITE_URL}/blog/${p.slug}`,
        datePublished: p.date,
      })),
    },
    breadcrumb([
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog" },
    ]),
  );
}

/** Artículo del blog: BlogPosting + BreadcrumbList (Inicio > Blog > artículo). */
export function blogPostJsonLd(post: BlogPost) {
  const content = post.post.es;
  const path = `/blog/${post.slug}`;
  return graph(
    {
      "@type": "BlogPosting",
      "@id": `${SITE_URL}${path}#article`,
      headline: content.title,
      description: content.description,
      url: `${SITE_URL}${path}`,
      mainEntityOfPage: `${SITE_URL}${path}`,
      inLanguage: "es",
      datePublished: post.date,
      dateModified: post.date,
      image: `${SITE_URL}${post.ogImage}`,
      author: personRef,
      publisher: personRef,
      isPartOf: { "@id": `${SITE_URL}/blog#blog` },
    },
    breadcrumb([
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: content.title, path },
    ]),
  );
}
