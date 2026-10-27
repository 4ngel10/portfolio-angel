import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { ProjectArticle } from "@/components/project-article";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { MobileContactCta } from "@/components/mobile-contact-cta";
import { JsonLd } from "@/components/json-ld";
import { PROJECTS, getProject } from "@/lib/projects";
import { alternatesFor, projectJsonLd } from "@/lib/seo";
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
    title: `${project.post.es.seoTitle ?? title} · Ángel Fernández`,
    description,
    alternates: alternatesFor(`/proyectos/${project.slug}`),
    openGraph: {
      title,
      description,
      type: "article",
      locale: "es_ES",
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
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <>
      <JsonLd data={projectJsonLd(project)} />
      <Nav />
      <ProjectArticle slug={slug} />
      <Footer />
      <MobileContactCta />
      <BackToTop />
    </>
  );
}
