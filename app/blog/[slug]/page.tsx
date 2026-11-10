import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { BlogArticle } from "@/components/blog-article";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { MobileContactCta } from "@/components/mobile-contact-cta";
import { JsonLd } from "@/components/json-ld";
import { getPublishedPost, getPublishedPosts } from "@/lib/blog-db";
import { resumenDe, siguienteDe } from "@/lib/blog-types";
import { SITE_URL } from "@/lib/site";
import { alternatesFor, blogPostJsonLd } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

// Una página estática por artículo publicado. Un artículo nuevo se genera en su primera visita
// (dynamicParams) y se regenera cada hora y al publicar desde el panel. Cualquier otro slug da 404.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getPublishedPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return {};
  const imagen = `${SITE_URL}${post.ogImage}`;
  const { title, seoTitle, description } = post.post.es;
  return {
    title: `${seoTitle ?? title} · Ángel Fernández`,
    description,
    alternates: alternatesFor(`/blog/${post.slug}`),
    openGraph: {
      title,
      description,
      type: "article",
      locale: "es_ES",
      publishedTime: post.date,
      authors: ["Ángel Fernández Garriga"],
      images: [{ url: imagen, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imagen] },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const [post, posts] = await Promise.all([getPublishedPost(slug), getPublishedPosts()]);
  if (!post) notFound();
  const siguiente = siguienteDe(posts, slug);

  return (
    <>
      <JsonLd data={blogPostJsonLd(post)} />
      <Nav />
      <BlogArticle post={post} next={siguiente ? resumenDe(siguiente) : null} />
      <Footer />
      <MobileContactCta />
      <BackToTop />
    </>
  );
}
