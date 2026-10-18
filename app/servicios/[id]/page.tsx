import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { ServicePage } from "@/components/services-page";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { MobileContactCta } from "@/components/mobile-contact-cta";
import { JsonLd } from "@/components/json-ld";
import { SERVICES, getService } from "@/lib/services";
import { SERVICE_DESCRIPTIONS, serviceJsonLd } from "@/lib/seo";
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
  const description = SERVICE_DESCRIPTIONS[service.id] ?? texts[`${service.key}Lead`];
  return {
    title: `${title} · Ángel Fernández`,
    description,
    alternates: { canonical: `/servicios/${service.id}` },
    openGraph: { title, description, type: "website", locale: "es_ES", alternateLocale: "en_GB" },
    twitter: { card: "summary", title, description },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { id } = await params;
  const service = getService(id);
  if (!service) notFound();

  return (
    <>
      <JsonLd data={serviceJsonLd(service)} />
      <Nav />
      <ServicePage id={id} />
      <Footer />
      <MobileContactCta />
      <BackToTop />
    </>
  );
}
