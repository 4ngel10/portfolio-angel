import { Nav } from "@/components/nav";
import { Hero } from "@/components/hero";
import { StackBand } from "@/components/stack-band";
import { About } from "@/components/about";
import { Services } from "@/components/services";
import { Portfolio } from "@/components/portfolio";
import { Contact } from "@/components/contact";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";

export default function Page() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <StackBand />
        <About />
        <Services />
        <Portfolio />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}
