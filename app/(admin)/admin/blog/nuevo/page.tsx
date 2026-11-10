import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { CAMPOS_VACIOS } from "@/lib/blog-editor";
import { SITE_URL } from "@/lib/site";
import { BlogEditor } from "@/components/portal/blog-editor";
import { PageHeader } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("blog.editor.newTitle") };
}

export default async function NuevoArticuloPage() {
  await requireAdmin();
  const { t } = await getI18n();
  return (
    <>
      <PageHeader title={t("blog.editor.newTitle")} />
      <BlogEditor
        inicial={{
          id: null,
          slug: "",
          category: "sistemas",
          ogImage: "",
          es: { ...CAMPOS_VACIOS },
          en: { ...CAMPOS_VACIOS },
        }}
        estado={null}
        fechaInicial=""
        conocidas={[]}
        versiones={[]}
        siteUrl={SITE_URL}
      />
    </>
  );
}
