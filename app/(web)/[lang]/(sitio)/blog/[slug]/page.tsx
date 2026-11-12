import { LOCALES, parseLang } from "@/lib/rutas";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/nav";
import { BlogArticle } from "@/components/blog-article";
import { Footer } from "@/components/footer";
import { Flotantes } from "@/components/flotantes";
import { JsonLd } from "@/components/json-ld";
import { getPublishedPost, getPublishedPosts } from "@/lib/blog-db";
import { resumenDe, siguienteDe, tieneIngles } from "@/lib/blog-types";
import { OG_LOCALE, alternatesFor, blogPostJsonLd } from "@/lib/seo";

type Params = Promise<{ lang: string; slug: string }>;

// Una página estática por artículo publicado. Un artículo nuevo se genera en su primera visita
// (dynamicParams) y se regenera cada hora y al publicar desde el panel. Cualquier otro slug da 404.
export const dynamicParams = true;
export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return LOCALES.flatMap((lang) =>
    posts.filter((p) => lang === "es" || tieneIngles(p)).map((p) => ({ lang, slug: p.slug })),
  );
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { lang: l, slug } = await params;
  const lang = parseLang(l);
  const post = await getPublishedPost(slug);
  if (!post || (lang === "en" && !tieneIngles(post))) return {};
  // La imagen para redes no va aquí: la sirve opengraph-image.tsx (la propia og_image del
  // artículo si la tiene, o la generada), y Next da prioridad al archivo sobre este objeto.
  const { title, seoTitle, description } = post.post[lang];
  return {
    title: `${seoTitle ?? title} · Ángel Fernández`,
    description,
    alternates: alternatesFor(`/blog/${post.slug}`, lang, tieneIngles(post) ? LOCALES : ["es"]),
    openGraph: {
      title,
      description,
      type: "article",
      locale: OG_LOCALE[lang],
      publishedTime: post.date,
      authors: ["Ángel Fernández Garriga"],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { lang: l, slug } = await params;
  const lang = parseLang(l);
  const [post, todos] = await Promise.all([getPublishedPost(slug), getPublishedPosts()]);
  // En inglés solo existe el artículo con traducción completa; si no, 404 (nunca español bajo /en).
  if (!post || (lang === "en" && !tieneIngles(post))) notFound();
  const posts = todos.filter((p) => lang === "es" || tieneIngles(p));
  const siguiente = siguienteDe(posts, slug);

  return (
    <>
      <JsonLd data={blogPostJsonLd(post, lang)} />
      <Nav alternate={tieneIngles(post) ? undefined : "/blog"} />
      <BlogArticle post={post} next={siguiente ? resumenDe(siguiente) : null} />
      <Footer />
      <Flotantes />
    </>
  );
}
