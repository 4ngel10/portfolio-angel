import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { StackBand } from "@/components/stack-band";
import { About } from "@/components/about";
import { Services } from "@/components/services";
import { Portfolio } from "@/components/portfolio";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { MobileContactCta } from "@/components/mobile-contact-cta";
import { JsonLd } from "@/components/json-ld";
import { homeJsonLd } from "@/lib/seo";

// Canonical solo en la home: en el layout lo heredarían páginas como el 404.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Page() {
  return (
    <>
      <JsonLd data={homeJsonLd()} />
      <Nav />
      <main id="main" tabIndex={-1} className="scroll-mt-[72px] outline-none">
        <Hero />
        <StackBand />
        <About />
        <Services />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <MobileContactCta />
      <BackToTop />
    </>
  );
}
