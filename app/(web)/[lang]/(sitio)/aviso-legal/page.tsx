import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { LegalPageView } from "@/components/legal-page";
import { Footer } from "@/components/footer";
import { Flotantes } from "@/components/flotantes";
import { getLegalPage } from "@/lib/legal";
import { OG_LOCALE, alternatesFor } from "@/lib/seo";
import { parseLang } from "@/lib/rutas";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  const { title, description } = getLegalPage("aviso-legal")!.content[lang];
  return {
    title: `${title} · Ángel Fernández`,
    description,
    alternates: alternatesFor("/aviso-legal", lang),
    openGraph: { title, description, type: "website", locale: OG_LOCALE[lang] },
    twitter: { card: "summary", title, description },
  };
}

export default function AvisoLegalPage() {
  return (
    <>
      <Nav />
      <LegalPageView page={getLegalPage("aviso-legal")!} />
      <Footer />
      <Flotantes contacto={false} />
    </>
  );
}
