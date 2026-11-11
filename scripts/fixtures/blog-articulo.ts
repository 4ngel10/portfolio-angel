/**
 * Artículo de ejemplo para scripts/probar-blog.ts. Lleva todos los tipos de bloque (H2, H3,
 * párrafos con negrita y enlaces, lista, lista ordenada e imágenes con y sin pie) y pasa el
 * comprobador de publicar sin errores. Antes las pruebas usaban los artículos de lib/blog.ts,
 * que ya no existe (el contenido vive en Supabase).
 */
import type { BlogPostContent } from "../../lib/blog-types";

export type ArticuloPrueba = {
  slug: string;
  category: "sistemas" | "desarrollo" | "automatizacion";
  ogImage: string | null;
  creadoPor: string;
  post: { es: BlogPostContent; en: BlogPostContent };
};

export const ARTICULO_EJEMPLO: ArticuloPrueba = {
  slug: "articulo-de-ejemplo",
  category: "sistemas",
  ogImage: null,
  creadoPor: "prueba",
  post: {
    es: {
      title: "Artículo de ejemplo para las pruebas del blog",
      seoTitle: "Artículo de ejemplo para las pruebas",
      excerpt: "Un artículo de prueba con todos los tipos de bloque que admite el blog.",
      description:
        "Artículo de ejemplo para las pruebas del blog, con todos los tipos de bloque y los enlaces que el comprobador exige antes de publicar.",
      intro:
        "Este artículo existe solo para las pruebas automáticas. Tiene **negrita** y un enlace a [servicios de sistemas](/servicios/sistemas).",
      sections: [
        {
          heading: "Primera sección",
          blocks: [
            "Un párrafo con un enlace a [otro artículo](/blog/mantenimiento-web-pyme) y a un [proyecto](/proyectos/flexgrip).",
            { h3: "Un subtítulo" },
            { list: ["Primer punto", "Segundo punto con **negrita**", "Tercer punto"] },
            {
              img: "/blog-img/articulo-de-ejemplo/uno.webp",
              alt: "Primera imagen de ejemplo, un rectángulo naranja",
              width: 1600,
              height: 800,
              caption: "Pie de la primera imagen.",
            },
          ],
        },
        {
          heading: "Segunda sección",
          blocks: [
            "Otro párrafo, ahora con una lista ordenada debajo.",
            { ol: ["Primer paso", "Segundo paso", "Tercer paso"] },
            {
              img: "/blog-img/articulo-de-ejemplo/dos.webp",
              alt: "Segunda imagen de ejemplo, un rectángulo azul",
              width: 1200,
              height: 600,
            },
          ],
        },
      ],
    },
    en: {
      title: "Sample article for the blog tests",
      seoTitle: "Sample article for the tests",
      excerpt: "A test article with every block type the blog supports.",
      description:
        "Sample article for the blog tests, with every block type and the links that the checker requires before an article can be published.",
      intro:
        "This article exists only for the automated tests. It has **bold** text and a link to [systems services](/servicios/sistemas).",
      sections: [
        {
          heading: "First section",
          blocks: [
            "A paragraph with a link to [another article](/blog/mantenimiento-web-pyme) and to a [project](/proyectos/flexgrip).",
            { h3: "A subheading" },
            { list: ["First point", "Second point with **bold**", "Third point"] },
            {
              img: "/blog-img/articulo-de-ejemplo/uno.webp",
              alt: "First sample image, an orange rectangle",
              width: 1600,
              height: 800,
              caption: "Caption of the first image.",
            },
          ],
        },
        {
          heading: "Second section",
          blocks: [
            "Another paragraph, now with an ordered list below it.",
            { ol: ["First step", "Second step", "Third step"] },
            {
              img: "/blog-img/articulo-de-ejemplo/dos.webp",
              alt: "Second sample image, a blue rectangle",
              width: 1200,
              height: 600,
            },
          ],
        },
      ],
    },
  },
};
