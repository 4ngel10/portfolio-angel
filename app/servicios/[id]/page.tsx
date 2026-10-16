import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectNav } from "@/components/project-nav";
import { ServicePage } from "@/components/services-page";
import { ProjectFooter } from "@/components/project-footer";
import { BackToTop } from "@/components/back-to-top";
import { SERVICES, getService } from "@/lib/services";
import es from "@/messages/es.json";

type Params = Promise<{ id: string }>;

// Una página estática por servicio; cualquier otro id da 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const service = getService((await params).id);
  if (!service) return {};
  const texts = es.services as Record<string, string>;
  const title = texts[`${service.key}Title`];
  const description = texts[`${service.key}Lead`];
  return {
    title: `${title} · Ángel Fernández`,
    description,
    alternates: { canonical: `/servicios/${service.id}` },
    openGraph: { title, description, type: "website", locale: "es_ES" },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  if (!getService(id)) notFound();

  return (
    <>
      <ProjectNav />
      <ServicePage id={id} />
      <ProjectFooter />
      <BackToTop />
    </>
  );
}
