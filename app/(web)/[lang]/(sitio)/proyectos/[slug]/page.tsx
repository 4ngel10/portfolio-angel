import { LOCALES, parseLang } from "@/lib/rutas";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { ProjectArticle } from "@/components/project-article";
import { Footer } from "@/components/footer";
import { Flotantes } from "@/components/flotantes";
import { JsonLd } from "@/components/json-ld";
import { getProyecto, getProyectos } from "@/lib/proyectos-db";
import { proyectoArticulo, proyectoCard, proyectoTieneIngles } from "@/lib/proyectos-types";
import { OG_LOCALE, alternatesFor, projectJsonLd } from "@/lib/seo";

type Params = Promise<{ lang: string; slug: string }>;

// Una página estática por proyecto publicado. Un proyecto nuevo (publicado desde el panel) se
// genera en su primera visita; uno que no existe o no está publicado da 404.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const lang of LOCALES) {
    for (const p of await getProyectos(lang)) params.push({ lang, slug: p.slug });
  }
  return params;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: l, slug } = await params;
  const lang = parseLang(l);
  const project = await getProyecto(slug);
  if (!project || (lang === "en" && !proyectoTieneIngles(project))) return {};
  const { title: cardTitle, desc: description, post } = project.content[lang];
  const title = post.title ?? cardTitle;
  return {
    title: `${post.seoTitle ?? title} · Ángel Fernández`,
    description,
    alternates: alternatesFor(`/proyectos/${project.slug}`, lang, proyectoTieneIngles(project) ? LOCALES : ["es"]),
    openGraph: {
      title,
      description,
      type: "article",
      locale: OG_LOCALE[lang],
      publishedTime: project.date,
      // La imagen sale de opengraph-image.tsx (la propia del proyecto, o una generada).
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { lang: l, slug } = await params;
  const lang = parseLang(l);
  const project = await getProyecto(slug);
  // En inglés solo existe el proyecto con artículo completo en inglés; si no, 404.
  if (!project || (lang === "en" && !proyectoTieneIngles(project))) notFound();
  const disponibles = await getProyectos(lang);
  const siguiente = disponibles[(disponibles.findIndex((p) => p.slug === slug) + 1) % disponibles.length];

  return (
    <>
      <JsonLd data={projectJsonLd(project, lang)} />
      <Nav alternate={proyectoTieneIngles(project) ? undefined : "/#portfolio"} />
      <ProjectArticle
        project={proyectoArticulo(project, lang)}
        next={siguiente.slug !== slug ? proyectoCard(siguiente, lang) : null}
      />
      <Footer />
      <Flotantes />
    </>
  );
}
