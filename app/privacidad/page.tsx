import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { LegalPageView } from "@/components/legal-page";
import { Footer } from "@/components/footer";
import { Flotantes } from "@/components/flotantes";
import { getLegalPage } from "@/lib/legal";
import { alternatesFor } from "@/lib/seo";

const { title, description } = getLegalPage("privacidad")!.content.es;

export const metadata: Metadata = {
  title: `${title} · Ángel Fernández`,
  description,
  alternates: alternatesFor("/privacidad"),
  openGraph: { title, description, type: "website", locale: "es_ES" },
  twitter: { card: "summary", title, description },
};

export default function PrivacidadPage() {
  return (
    <>
      <Nav />
      <LegalPageView page={getLegalPage("privacidad")!} />
      <Footer />
      <Flotantes contacto={false} />
    </>
  );
}
