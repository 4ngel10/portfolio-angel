import type { Metadata } from "next";
import { ProjectNav } from "@/components/project-nav";
import { BlogIndex } from "@/components/blog-index";
import { ProjectFooter } from "@/components/project-footer";
import { BackToTop } from "@/components/back-to-top";
import { JsonLd } from "@/components/json-ld";
import { BLOG_DESCRIPTION, BLOG_TITLE, blogIndexJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  alternates: { canonical: "/blog" },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    type: "website",
    locale: "es_ES",
    alternateLocale: "en_GB",
  },
  twitter: { card: "summary", title: BLOG_TITLE, description: BLOG_DESCRIPTION },
};

export default function BlogPage() {
  return (
    <>
      <JsonLd data={blogIndexJsonLd()} />
      <ProjectNav />
      <BlogIndex />
      <ProjectFooter />
      <BackToTop />
    </>
  );
}
