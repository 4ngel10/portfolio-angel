import { LOCALES, parseLang } from "@/lib/rutas";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { ServicePage } from "@/components/services-page";
import { Footer } from "@/components/footer";
import { Flotantes } from "@/components/flotantes";
import { JsonLd } from "@/components/json-ld";
import { getProyectoCardsServicio } from "@/lib/proyectos-db";
import type { ProyectoCard } from "@/lib/proyectos-types";
import { SERVICES, getService } from "@/lib/services";
import { OG_LOCALE, SERVICE_DESCRIPTIONS, SERVICE_TITLES, alternatesFor, serviceJsonLd } from "@/lib/seo";
import es from "@/messages/es.json";
import en from "@/messages/en.json";

type Params = Promise<{ lang: string; id: string }>;

// Una página estática por servicio; cualquier otro id da 404.
export const dynamicParams = false;
// Las cards de proyectos salen de Supabase: se regenera cada hora y al cambiar desde el panel.
export const revalidate = 3600;

export function generateStaticParams() {
  return LOCALES.flatMap((lang) => SERVICES.map((s) => ({ lang, id: s.id })));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: l, id } = await params;
  const lang = parseLang(l);
  const service = getService(id);
  if (!service) return {};
  const texts = (lang === "en" ? en : es).services as Record<string, string>;
  const title = SERVICE_TITLES[lang][service.id] ?? texts[`${service.key}Title`];
  const description = SERVICE_DESCRIPTIONS[lang][service.id] ?? texts[`${service.key}Lead`];
  return {
    title: `${title} · Ángel Fernández`,
    description,
    alternates: alternatesFor(`/servicios/${service.id}`, lang),
    openGraph: { title, description, type: "website", locale: OG_LOCALE[lang] },
    twitter: { card: "summary", title, description },
  };
}

export default async function Page({ params }: { params: Params }) {
  const { lang: l, id } = await params;
  const lang = parseLang(l);
  const service = getService(id);
  if (!service) notFound();
  const otro = SERVICES[(SERVICES.indexOf(service) + 1) % SERVICES.length];
  // Las cards de los proyectos de este servicio (los elige el panel, y solo salen los publicados)
  // y, al final, la de esta misma web ("self").
  const proyectos: (ProyectoCard | "self")[] =
    service.id === "web" || service.id === "sistemas"
      ? await getProyectoCardsServicio(service.id, lang)
      : [];
  if (service.self) proyectos.push("self");

  return (
    <>
      <JsonLd data={serviceJsonLd(service, lang)} />
      <Nav />
      <ServicePage service={service} other={{ id: otro.id, key: otro.key }} projects={proyectos} />
      <Footer />
      <Flotantes />
    </>
  );
}
