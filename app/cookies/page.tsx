import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { LegalPageView } from "@/components/legal-page";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { getLegalPage } from "@/lib/legal";
import { alternatesFor } from "@/lib/seo";

const { title, description } = getLegalPage("cookies")!.content.es;

export const metadata: Metadata = {
  title: `${title} · Ángel Fernández`,
  description,
  alternates: alternatesFor("/cookies"),
  openGraph: { title, description, type: "website", locale: "es_ES" },
  twitter: { card: "summary", title, description },
};

export default function CookiesPage() {
  return (
    <>
      <Nav />
      <LegalPageView id="cookies" />
      <Footer />
      <BackToTop />
    </>
  );
}
