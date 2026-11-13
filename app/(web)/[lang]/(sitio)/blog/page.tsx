import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { BlogIndex } from "@/components/blog-index";
import { Footer } from "@/components/footer";
import { Flotantes } from "@/components/flotantes";
import { JsonLd } from "@/components/json-ld";
import { getPublishedPosts } from "@/lib/blog-db";
import { resumenDe, tieneIngles } from "@/lib/blog-types";
import { BLOG_DESCRIPTIONS, BLOG_TITLES, OG_LOCALE, alternatesFor, blogIndexJsonLd } from "@/lib/seo";
import { parseLang } from "@/lib/rutas";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const lang = parseLang((await params).lang);
  const title = BLOG_TITLES[lang];
  const description = BLOG_DESCRIPTIONS[lang];
  return {
    title,
    description,
    alternates: alternatesFor("/blog", lang),
    openGraph: { title, description, type: "website", locale: OG_LOCALE[lang] },
    twitter: { card: "summary", title, description },
  };
}

// Página estática que se regenera sola cada hora (así aparece un artículo programado) y al
// publicar desde el panel (revalidarBlog).
export const revalidate = 3600;

export default async function BlogPage({ params }: { params: Promise<{ lang: string }> }) {
  const lang = parseLang((await params).lang);
  // En inglés solo los artículos con traducción completa; sin ninguno, la página no existe.
  const posts = (await getPublishedPosts()).filter((p) => lang === "es" || tieneIngles(p));
  if (posts.length === 0 && lang === "en") notFound();
  return (
    <>
      <JsonLd data={blogIndexJsonLd(posts, lang)} />
      <Nav />
      <BlogIndex posts={posts.map(resumenDe)} />
      <Footer />
      <Flotantes />
    </>
  );
}
