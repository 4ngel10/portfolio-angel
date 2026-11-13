import { LOCALES, parseLang } from "@/lib/rutas";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { ProjectArticle } from "@/components/project-article";
import { Footer } from "@/components/footer";
import { Flotantes } from "@/components/flotantes";
import { JsonLd } from "@/components/json-ld";
import { PROJECTS, getProject, projectCard, proyectoTieneIngles } from "@/lib/projects";
import { OG_LOCALE, alternatesFor, projectJsonLd } from "@/lib/seo";
import es from "@/messages/es.json";
import en from "@/messages/en.json";

type Params = Promise<{ lang: string; slug: string }>;

// Una página estática por proyecto; cualquier otro slug da 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => PROJECTS.filter((p) => lang === "es" || proyectoTieneIngles(p)).map((p) => ({ lang, slug: p.slug })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: l, slug } = await params;
  const lang = parseLang(l);
  const project = getProject(slug);
  if (!project || (lang === "en" && !proyectoTieneIngles(project))) return {};
  const portfolio = (lang === "en" ? en : es).portfolio as Record<string, string>;
  const title = project.post[lang].title ?? portfolio[`${project.key}Title`];
  const description = portfolio[`${project.key}Desc`];
  return {
    title: `${project.post[lang].seoTitle ?? title} · Ángel Fernández`,
    description,
    alternates: alternatesFor(`/proyectos/${project.slug}`, lang, proyectoTieneIngles(project) ? LOCALES : ["es"]),
    openGraph: {
      title,
      description,
      type: "article",
      locale: OG_LOCALE[lang],
      ...(project.date && { publishedTime: project.date }),
      ...(project.ogImage && { images: [{ url: project.ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: project.ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(project.ogImage && { images: [project.ogImage] }),
    },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { lang: l, slug } = await params;
  const lang = parseLang(l);
  const project = getProject(slug);
  // En inglés solo existe el proyecto con artículo completo en inglés; si no, 404.
  if (!project || (lang === "en" && !proyectoTieneIngles(project))) notFound();
  const disponibles = PROJECTS.filter((p) => lang === "es" || proyectoTieneIngles(p));
  const siguiente = disponibles[(disponibles.indexOf(project) + 1) % disponibles.length];

  return (
    <>
      <JsonLd data={projectJsonLd(project, lang)} />
      <Nav alternate={proyectoTieneIngles(project) ? undefined : "/#portfolio"} />
      <ProjectArticle
        project={project}
        next={siguiente !== project ? projectCard(siguiente) : null}
      />
      <Footer />
      <Flotantes />
    </>
  );
}
