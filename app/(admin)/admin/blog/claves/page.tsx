import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { listarClaves } from "@/lib/blog-admin";
import { BlogClaves } from "@/components/portal/blog-claves";
import { PageHeader } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("blog.keys.title") };
}

export default async function ClavesBlogPage() {
  await requireAdmin();
  const { t } = await getI18n();
  const claves = await listarClaves();
  return (
    <>
      <Link href="/admin/blog" className="text-muted hover:text-ink mb-3 inline-block text-sm">
        {t("blog.editor.back")}
      </Link>
      <PageHeader title={t("blog.keys.title")} intro={t("blog.keys.intro")} />
      <BlogClaves claves={claves} />
    </>
  );
}
