import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { estadoDe, listarVersiones, obtenerPostAdmin } from "@/lib/blog-admin";
import { contenidoAEditor } from "@/lib/blog-editor";
import { imagenesConocidas } from "@/lib/blog-markup";
import { utcAMadridLocal } from "@/lib/blog-types";
import { SITE_URL } from "@/lib/site";
import { BlogEditor } from "@/components/portal/blog-editor";
import { PageHeader } from "@/components/portal/ui";

type Params = Promise<{ id: string }>;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("blog.editor.editTitle") };
}

export default async function EditarArticuloPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;
  const fila = await obtenerPostAdmin(id);
  if (!fila) notFound();
  const { t } = await getI18n();
  const versiones = await listarVersiones(fila.id);

  const conocidas = ([...imagenesConocidas(fila.content.es.sections), ...imagenesConocidas(fila.content.en.sections)]).map(
    ([ruta, tamano]) => ({ ruta, ...tamano }),
  );

  return (
    <>
      <Link href="/admin/blog" className="text-muted hover:text-ink mb-3 inline-block text-sm">
        {t("blog.editor.back")}
      </Link>
      <PageHeader title={fila.content.es.title || t("blog.editor.editTitle")} />
      {/* La clave cambia al restaurar una versión o guardar desde otra pestaña, y el editor se rehace con lo guardado. */}
      <BlogEditor
        key={`${fila.id}:${fila.updated_at}:${versiones[0]?.id ?? ""}`}
        inicial={{
          id: fila.id,
          slug: fila.slug,
          category: fila.category,
          ogImage: fila.og_image ?? "",
          es: contenidoAEditor(fila.content.es),
          en: contenidoAEditor(fila.content.en),
        }}
        estado={estadoDe(fila)}
        fechaInicial={fila.published_at ? utcAMadridLocal(fila.published_at) : ""}
        conocidas={conocidas}
        versiones={versiones}
        siteUrl={SITE_URL}
        creadoPor={fila.created_by}
      />
    </>
  );
}
