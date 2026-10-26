import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { NotFoundContent } from "@/components/not-found-content";

// Next ya añade <meta name="robots" content="noindex"> a la respuesta 404.
export const metadata: Metadata = { title: "Página no encontrada · Ángel Fernández" };

export default function NotFound() {
  return (
    <>
      <Nav />
      <NotFoundContent />
      <Footer />
    </>
  );
}
