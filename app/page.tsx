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
import { getLatestPosts } from "@/lib/blog-db";
import { enlaceDe } from "@/lib/blog-types";
import { projectCards } from "@/lib/projects";
import { SERVICES } from "@/lib/services";
import { TESTIMONIALS } from "@/lib/testimonials";
import { alternatesFor, homeJsonLd } from "@/lib/seo";

// Canonical solo en la home: en el layout lo heredarían páginas como el 404.
export const metadata: Metadata = { alternates: alternatesFor("/") };

// Estática; se regenera cada hora y al publicar desde el panel por el teaser del blog.
export const revalidate = 3600;

export default async function Page() {
  const ultimos = await getLatestPosts(2);
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Nav />
      <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
        <Hero />
        <Services items={SERVICES.map(({ key, id }) => ({ key, id }))} />
        <Portfolio projects={projectCards()} />
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
