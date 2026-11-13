/**
 * Proyectos inventados para las pruebas de scripts/probar-proyectos.ts. No son datos reales: cubren
 * todos los tipos de bloque (H3, listas, listas ordenadas, imágenes con pie, negrita y enlaces), el
 * resumen del caso con cifras, fragmento y cita, y los dos idiomas. Sustituyen a lib/projects.ts, que
 * ya no existe (los proyectos viven en Supabase).
 */
import type { CaseStudy, Post, ProyectoFact, ProyectoServicio } from "../../lib/proyectos-types";

export type ProyectoPrueba = {
  slug: string;
  service: ProyectoServicio;
  tech: string[];
  cover: string;
  tint: number;
  url?: string;
  image?: string;
  imageDark?: string;
  ogImage?: string;
  coverPosition?: "top" | "center";
  date: string;
  datosProvisionales: boolean;
  es: {
    title: string;
    tag: string;
    desc: string;
    coverAlt?: string;
    post: Post;
    facts: ProyectoFact[];
    caseStudy?: CaseStudy;
  };
  en: {
    title: string;
    tag: string;
    desc: string;
    coverAlt?: string;
    post: Post;
    facts: ProyectoFact[];
    caseStudy?: CaseStudy;
  };
};

export const PROYECTOS_PRUEBA: ProyectoPrueba[] = [
  {
    slug: "proyecto-prueba-sistemas",
    service: "sistemas",
    tech: ["PowerShell", "Active Directory", "GPO"],
    cover: "PS1",
    tint: 8,
    image: "/projects/prueba-cover.svg",
    ogImage: "/projects/prueba-og.jpg",
    date: "2026-10-17",
    datosProvisionales: true,
    es: {
      title: "Automatizar un proceso de pruebas",
      tag: "Automatización",
      desc: "Un script lanzado por GPO que prepara el puesto de cada usuario. Sirve para probar el comprobador.",
      coverAlt: "Una ventana de terminal con un script en marcha.",
      post: {
        title: "Automatizar un proceso de pruebas con PowerShell",
        seoTitle: "Proceso de pruebas con PowerShell",
        intro:
          "Un proyecto inventado con todos los tipos de bloque, para probar el conversor y el comprobador.",
        sections: [
          {
            heading: "El problema",
            blocks: [
              "Cada alta obligaba a **repetir** los mismos pasos a mano. Más información en [servicios](/servicios/sistemas).",
              { h3: "Lo que pasaba" },
              { list: ["Pasos manuales en cada puesto.", "Errores que nadie veía hasta tarde."] },
            ],
          },
          {
            heading: "La idea",
            blocks: [
              "Un script que hace los pasos solo.",
              {
                ol: [
                  "Leer los datos del usuario.",
                  "Aplicar la configuración.",
                  "Anotar el resultado.",
                ],
              },
              {
                img: "/projects/prueba-1.webp",
                alt: "Un esquema del flujo.",
                width: 1200,
                height: 675,
                caption: "El flujo completo",
              },
            ],
          },
        ],
      },
      facts: [
        { label: "Tipo", value: "Proyecto de prueba" },
        { label: "Alcance", value: "Un puesto de ejemplo" },
        { label: "Resultado", value: "Pasos de 20 a 2 minutos" },
      ],
      caseStudy: {
        context: "Un cliente inventado con unos 90 usuarios.",
        role: "Planteé el enfoque y desarrollé el script.",
        results: [
          { label: "Incidencias al mes", before: "unas 14", after: "unas 4" },
          { label: "Alta de un puesto", before: "unos 20 minutos", after: "un par de minutos" },
        ],
        snippet: {
          title: "Un fragmento",
          code: "Get-Printer | Where-Object { $_.Name -like 'Prueba*' }",
        },
      },
    },
    en: {
      title: "Automating a test process",
      tag: "Automation",
      desc: "A script launched by GPO that prepares each user's desk. It is used to test the checker.",
      coverAlt: "A terminal window with a script running.",
      post: {
        title: "Automating a test process with PowerShell",
        seoTitle: "Test process with PowerShell",
        intro: "A made-up project with every block type, to test the converter and the checker.",
        sections: [
          {
            heading: "The problem",
            blocks: [
              "Every new hire meant **repeating** the same steps by hand. More in [services](/servicios/sistemas).",
              { h3: "What happened" },
              { list: ["Manual steps on every desk.", "Mistakes nobody saw until later."] },
            ],
          },
          {
            heading: "The idea",
            blocks: [
              "A script that does the steps on its own.",
              { ol: ["Read the user's data.", "Apply the configuration.", "Log the result."] },
              {
                img: "/projects/prueba-1.webp",
                alt: "A diagram of the flow.",
                width: 1200,
                height: 675,
                caption: "The whole flow",
              },
            ],
          },
        ],
      },
      facts: [
        { label: "Type", value: "Test project" },
        { label: "Scope", value: "One example desk" },
        { label: "Result", value: "Steps from 20 to 2 minutes" },
      ],
      caseStudy: {
        context: "A made-up client with about 90 users.",
        role: "I came up with the approach and built the script.",
        results: [
          { label: "Incidents per month", before: "about 14", after: "about 4" },
          { label: "Setting up a desk", before: "about 20 minutes", after: "a couple of minutes" },
        ],
        snippet: {
          title: "A snippet",
          code: "Get-Printer | Where-Object { $_.Name -like 'Test*' }",
        },
      },
    },
  },
  {
    slug: "proyecto-prueba-web",
    service: "web",
    tech: ["Next.js", "Supabase", "Tailwind", "PWA"],
    cover: "AI",
    tint: 14,
    url: "https://ejemplo.invalid/",
    image: "/projects/prueba-web.webp",
    imageDark: "/projects/prueba-web-dark.webp",
    ogImage: "/projects/prueba-web-og.jpg",
    coverPosition: "top",
    date: "2026-10-20",
    datosProvisionales: false,
    es: {
      title: "Una web de prueba",
      tag: "Desarrollo web",
      desc: "Una web inventada con portada clara y oscura. Sirve para probar cita y permiso.",
      coverAlt: "Captura de una web de prueba.",
      post: {
        title: "Una web de prueba, de principio a fin",
        intro: "Otro proyecto inventado, esta vez de desarrollo web.",
        sections: [
          {
            heading: "Qué hice",
            blocks: [
              "Diseñé y desarrollé la web de principio a fin. Mira [otro proyecto](/proyectos/proyecto-prueba-sistemas).",
            ],
          },
        ],
      },
      facts: [
        { label: "Tipo", value: "Proyecto propio" },
        { label: "Alcance", value: "Diseño y desarrollo" },
        { label: "Estado", value: "En línea" },
      ],
    },
    en: {
      title: "A test website",
      tag: "Web development",
      desc: "A made-up website with a light and a dark cover. It is used to test quote and permission.",
      coverAlt: "Screenshot of a test website.",
      post: {
        title: "A test website, built end to end",
        intro: "Another made-up project, this time in web development.",
        sections: [
          {
            heading: "What I did",
            blocks: [
              "I designed and built the site end to end. See [another project](/proyectos/proyecto-prueba-sistemas).",
            ],
          },
        ],
      },
      facts: [
        { label: "Type", value: "Own project" },
        { label: "Scope", value: "Design and development" },
        { label: "Status", value: "Live" },
      ],
    },
  },
];
