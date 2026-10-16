import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectNav } from "@/components/project-nav";
import { ProjectArticle } from "@/components/project-article";
import { ProjectFooter } from "@/components/project-footer";
import { BackToTop } from "@/components/back-to-top";
import { PROJECTS, getProject } from "@/lib/projects";
import es from "@/messages/es.json";

type Params = Promise<{ slug: string }>;

// Una página estática por proyecto; cualquier otro slug da 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const project = getProject((await params).slug);
  if (!project) return {};
  const portfolio = es.portfolio as Record<string, string>;
  const title = project.post.es.title ?? portfolio[`${project.key}Title`];
  const description = portfolio[`${project.key}Desc`];
  return {
    title: `${title} · Ángel Fernández`,
    description,
    alternates: { canonical: `/proyectos/${project.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "es_ES",
      ...(project.image && { images: [project.image] }),
    },
  };
}

export default async function ProjectPage({ params }: { params: Params }) {
  const { slug } = await params;
  if (!getProject(slug)) notFound();

  return (
    <>
      <ProjectNav />
      <ProjectArticle slug={slug} />
      <ProjectFooter />
      <BackToTop />
    </>
  );
}
