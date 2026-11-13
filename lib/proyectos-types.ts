/**
 * Tipos de los proyectos del portfolio sin dependencias de servidor: los pueden importar los
 * componentes de cliente. El contenido vive en Supabase (`portfolio_projects`) y se gestiona en
 * /admin/portfolio; la lectura pública está en lib/proyectos-db.ts.
 *
 * Dentro del texto de los artículos: **negrita** y [enlace](https://...). Sin em dashes.
 */

import type { Locale } from "./i18n";

/** Imagen dentro del artículo. width y height son los del archivo, para reservar el hueco. */
export type PostImage = {
  img: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
};
/** Un string es un párrafo, `{ h3 }` un subtítulo, `{ list }` una lista, `{ ol }` una numerada. */
export type PostBlock = string | { h3: string } | { list: string[] } | { ol: string[] } | PostImage;
/** Cada sección es un H2 (opcional: sin `heading` los bloques siguen a la entradilla). */
export type PostSection = { heading?: string; blocks: PostBlock[] };
export type Post = { title?: string; seoTitle?: string; intro?: string; sections: PostSection[] };

/**
 * Resumen estructurado de un caso. Todo es opcional y solo se pinta lo que tiene contenido. Las
 * cifras de `results` y la `quote` tienen que ser reales (la cita, con permiso del cliente); el
 * `snippet` va sin datos del cliente.
 */
export type CaseStudy = {
  /** Situación del cliente antes del proyecto. */
  context?: string;
  /** Qué hice yo en concreto. */
  role?: string;
  /** Cifras reales antes y después. */
  results?: { label: string; before: string; after: string }[];
  /** Fragmento de código o configuración, saneado. */
  snippet?: { title?: string; code: string };
  /** Cita del cliente, con su permiso. */
  quote?: { text: string; author: string; permiso?: boolean };
};

export type ProyectoFact = { label: string; value: string };

/** Lo que cambia por idioma: textos de la card, de la cabecera y del artículo. */
export type ProyectoLocale = {
  /** Título corto de la card. */
  title: string;
  /** Una palabra con el área del proyecto (dos en "Desarrollo web"). */
  tag: string;
  /** Descripción de una o dos frases de la card. */
  desc: string;
  /** Texto alternativo de la portada: qué se ve en la imagen. */
  coverAlt?: string;
  post: Post;
  /** Ficha rápida de la cabecera, 3 datos. */
  facts: ProyectoFact[];
  caseStudy?: CaseStudy;
};

export type ProyectoContent = Record<Locale, ProyectoLocale>;

export type ProyectoServicio = "web" | "sistemas";
export type ProyectoEstado = "borrador" | "publicado";

/** La fila de `portfolio_projects` ya mapeada. */
export type Proyecto = {
  id: string;
  slug: string;
  tech: string[];
  /** Texto de la portada cuando no hay imagen. */
  cover: string;
  /** Porcentaje de acento mezclado en el fondo de la portada. */
  tint: number;
  /** Web pública del proyecto, si la tiene. */
  url?: string;
  image?: string;
  imageDark?: string;
  /** "top" para capturas de pantalla, "center" (por defecto) para fotos. */
  coverPosition?: "top" | "center";
  /** Imagen para redes (Open Graph), 1200x630. */
  ogImage?: string;
  /** Fecha de publicación del artículo, AAAA-MM-DD. */
  date: string;
  service: ProyectoServicio;
  /** Posición en la home, de menor a mayor. */
  orden: number;
  status: ProyectoEstado;
  /** ISO 8601. Con fecha futura el proyecto está programado. */
  publishedAt: string | null;
  updatedAt: string;
  /** Páginas de servicio donde sale el proyecto, elegido en el panel. */
  enServicios: ProyectoServicio[];
  /** Caso de ejemplo inventado, no un cliente real. */
  ejemplo: boolean;
  /** Cifras sin validar: no se pueden publicar como reales. */
  datosProvisionales: boolean;
  content: ProyectoContent;
};

/**
 * Lo que pintan las cards y las portadas, ya con el texto de un solo idioma. Los componentes de
 * cliente reciben esto por props: así el artículo completo no viaja en el JS de la home.
 */
export type ProyectoCard = {
  slug: string;
  title: string;
  tag: string;
  desc: string;
  coverAlt?: string;
  tech: string[];
  image?: string;
  imageDark?: string;
  cover: string;
  tint: number;
  coverPosition?: "top" | "center";
};

/**
 * ¿Tiene el proyecto artículo completo en inglés? Solo entonces existe /en/proyectos/<slug>, entra
 * en el sitemap y lleva hreflang. Si no, esa URL devuelve 404.
 */
export function proyectoTieneIngles(p: {
  content: Partial<Record<Locale, { post?: Post }>>;
}): boolean {
  const post = p.content.en?.post;
  return (
    !!post &&
    (post.title ?? "").trim() !== "" &&
    (post.intro ?? "").trim() !== "" &&
    post.sections.length > 0
  );
}

/** Un proyecto publicado: la fecha de publicación existe siempre. */
export type ProyectoPublicado = Proyecto & { publishedAt: string };

/**
 * Lo que pinta la página de un proyecto, con el texto de un solo idioma. El componente de cliente
 * recibe esto por props, así el texto en el otro idioma no viaja en el JS ni en el HTML.
 */
export type ProyectoArticulo = Pick<
  Proyecto,
  "slug" | "tech" | "cover" | "tint" | "url" | "image" | "imageDark" | "coverPosition" | "date" | "service"
> & { texto: ProyectoLocale };

export function proyectoCard(p: Proyecto, lang: Locale): ProyectoCard {
  const { slug, tech, image, imageDark, cover, tint, coverPosition } = p;
  const { title, tag, desc, coverAlt } = p.content[lang];
  return { slug, title, tag, desc, coverAlt, tech, image, imageDark, cover, tint, coverPosition };
}

export function proyectoArticulo(p: Proyecto, lang: Locale): ProyectoArticulo {
  const { slug, tech, cover, tint, url, image, imageDark, coverPosition, date, service } = p;
  return { slug, tech, cover, tint, url, image, imageDark, coverPosition, date, service, texto: p.content[lang] };
}
