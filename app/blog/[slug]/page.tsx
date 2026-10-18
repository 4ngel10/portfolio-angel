import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { BlogArticle } from "@/components/blog-article";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { MobileContactCta } from "@/components/mobile-contact-cta";
import { JsonLd } from "@/components/json-ld";
import { BLOG_POSTS, getBlogPost } from "@/lib/blog";
import { blogPostJsonLd } from "@/lib/seo";

type Params = Promise<{ slug: string }>;

// Una página estática por artículo; cualquier otro slug da 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  if (!post) return {};
  const { title, description } = post.post.es;
  return {
    title: `${title} · Ángel Fernández`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title,
      description,
      type: "article",
      locale: "es_ES",
      alternateLocale: "en_GB",
      publishedTime: post.date,
      authors: ["Ángel Fernández Garriga"],
      images: [{ url: post.ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", title, description, images: [post.ogImage] },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd data={blogPostJsonLd(post)} />
      <Nav />
      <BlogArticle slug={slug} />
      <Footer />
      <MobileContactCta />
      <BackToTop />
    </>
  );
}
