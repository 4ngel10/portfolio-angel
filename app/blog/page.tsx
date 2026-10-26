import type { Metadata } from "next";
import { Nav } from "@/components/nav";
import { BlogIndex } from "@/components/blog-index";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { MobileContactCta } from "@/components/mobile-contact-cta";
import { JsonLd } from "@/components/json-ld";
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

export default function BlogPage() {
  return (
    <>
      <JsonLd data={blogIndexJsonLd()} />
      <Nav />
      <BlogIndex />
      <Footer />
      <MobileContactCta />
      <BackToTop />
    </>
  );
}
