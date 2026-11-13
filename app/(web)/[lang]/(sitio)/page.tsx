import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { About } from "@/components/about";
import { Services } from "@/components/services";
import { Portfolio } from "@/components/portfolio";
import { BlogTeaser } from "@/components/blog-teaser";
import { Contact } from "@/components/contact";
import { Testimonials } from "@/components/testimonials";
import { Footer } from "@/components/footer";
import { Flotantes } from "@/components/flotantes";
import { JsonLd } from "@/components/json-ld";
import { getLatestPosts, getPublishedPosts } from "@/lib/blog-db";
import { enlaceDe, tieneIngles } from "@/lib/blog-types";
import { getProyectoCards } from "@/lib/proyectos-db";
import { SERVICES } from "@/lib/services";
import { TESTIMONIALS } from "@/lib/testimonials";
import { alternatesFor, homeJsonLd } from "@/lib/seo";
import { parseLang } from "@/lib/rutas";

// Canonical solo en la home: en el layout lo heredarían páginas como el 404.
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  return { alternates: alternatesFor("/", parseLang((await params).lang)) };
}

// Estática; se regenera cada hora y al publicar desde el panel por el teaser del blog.
export const revalidate = 3600;

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  // En inglés solo salen los artículos que tienen traducción completa.
  const ultimos =
    lang === "en"
      ? (await getPublishedPosts()).filter(tieneIngles).slice(0, 2)
      : await getLatestPosts(2);
  const proyectos = await getProyectoCards(lang);
  return (
    <>
      <JsonLd data={homeJsonLd(lang)} />
      <Nav />
      <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
        <Hero />
        <Services items={SERVICES.map(({ key, id }) => ({ key, id }))} />
        <Portfolio projects={proyectos} />
        <Testimonials items={TESTIMONIALS.filter((t) => t.permission)} />
        <About />
        <BlogTeaser posts={ultimos.map(enlaceDe)} />
        <Contact />
      </main>
      <Footer />
      <Flotantes />
    </>
  );
}
