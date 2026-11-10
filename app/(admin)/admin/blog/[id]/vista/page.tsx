import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { obtenerPostAdmin } from "@/lib/blog-admin";
import type { BlogPost } from "@/lib/blog-types";
import { BlogVista } from "@/components/portal/blog-vista";

type Params = Promise<{ id: string }>;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("blog.preview.title"), robots: { index: false, follow: false } };
}

export default async function VistaPreviaPage({ params }: { params: Params }) {
  await requireAdmin();
  const fila = await obtenerPostAdmin((await params).id);
  if (!fila) notFound();
  const { t } = await getI18n();

  const publicado = fila.published_at ?? new Date().toISOString();
  const dia = new Date(publicado).toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  const post: BlogPost = {
    slug: fila.slug,
    category: fila.category,
    date: dia,
    publishedAt: publicado,
    updatedAt: fila.updated_at,
    ogImage: fila.og_image ?? `/blog-img/${fila.slug}/og.jpg`,
    post: fila.content,
  };

  return (
    <>
      <Link
        href={`/admin/blog/${fila.id}`}
        className="text-muted hover:text-ink mb-3 inline-block text-sm"
      >
        {t("blog.preview.edit")}
      </Link>
      <BlogVista post={post} />
    </>
  );
}
