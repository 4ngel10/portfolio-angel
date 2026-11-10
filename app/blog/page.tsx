import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { BlogIndex } from "@/components/blog-index";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { MobileContactCta } from "@/components/mobile-contact-cta";
import { JsonLd } from "@/components/json-ld";
import { getPublishedPosts } from "@/lib/blog-db";
import { resumenDe } from "@/lib/blog-types";
import { BLOG_DESCRIPTION, BLOG_TITLE, alternatesFor, blogIndexJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  alternates: alternatesFor("/blog"),
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    type: "website",
    locale: "es_ES",
  },
  twitter: { card: "summary", title: BLOG_TITLE, description: BLOG_DESCRIPTION },
};

// Página estática que se regenera sola cada hora (así aparece un artículo programado) y al
// publicar desde el panel (revalidarBlog).
export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return (
    <>
      <JsonLd data={blogIndexJsonLd(posts)} />
      <Nav />
      <BlogIndex posts={posts.map(resumenDe)} />
      <Footer />
      <MobileContactCta />
      <BackToTop />
    </>
  );
}
