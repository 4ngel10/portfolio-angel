import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { imagenesConocidas } from "@/lib/blog-markup";
import { utcAMadridLocal } from "@/lib/blog-types";
import { estadoDe, listarVersionesProyecto, obtenerProyectoAdmin } from "@/lib/proyectos-admin";
import { contenidoAEditor } from "@/lib/proyectos-editor";
import { portadasConocidas } from "@/lib/proyectos-portadas";
import { palabrasProhibidasDeEntorno } from "@/lib/proyectos-validate";
import { SITE_URL } from "@/lib/site";
import { PortfolioEditor } from "@/components/portal/portfolio-editor";
import { PageHeader } from "@/components/portal/ui";

type Params = Promise<{ id: string }>;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("portfolio.editor.editTitle") };
}

export default async function EditarProyectoPage({ params }: { params: Params }) {
  await requireAdmin();
  const { id } = await params;
  const fila = await obtenerProyectoAdmin(id);
  if (!fila) notFound();
  const { t } = await getI18n();
  const [versiones, portadas] = await Promise.all([
    listarVersionesProyecto(fila.id),
    portadasConocidas(),
  ]);

  const conocidas = [
    ...imagenesConocidas(fila.content.es.post.sections),
    ...imagenesConocidas(fila.content.en.post.sections),
  ].map(([ruta, tamano]) => ({ ruta, ...tamano }));

  return (
    <>
      <Link href="/admin/portfolio" className="text-muted hover:text-ink mb-3 inline-block text-sm">
        {t("portfolio.editor.back")}
      </Link>
      <PageHeader title={fila.content.es.title || t("portfolio.editor.editTitle")} />
      {/* La clave cambia al restaurar una versión o guardar desde otra pestaña, y el editor se rehace con lo guardado. */}
      <PortfolioEditor
        key={`${fila.id}:${fila.updated_at}:${versiones[0]?.id ?? ""}`}
        inicial={{
          id: fila.id,
          slug: fila.slug,
          service: fila.service,
          tech: [...fila.tech, "", "", "", ""].slice(0, 4),
          cover: fila.cover,
          tint: fila.tint,
          url: fila.url ?? "",
          image: fila.image ?? "",
          imageDark: fila.image_dark ?? "",
          coverPosition: fila.cover_position ?? "",
          ogImage: fila.og_image ?? "",
          enServicios: fila.en_servicios,
          ejemplo: fila.ejemplo,
          datosProvisionales: fila.datos_provisionales,
          es: contenidoAEditor(fila.content.es),
          en: contenidoAEditor(fila.content.en),
        }}
        estado={estadoDe(fila)}
        fechaInicial={fila.published_at ? utcAMadridLocal(fila.published_at) : ""}
        conocidas={conocidas}
        versiones={versiones}
        siteUrl={SITE_URL}
        prohibidas={palabrasProhibidasDeEntorno()}
        portadas={portadas}
      />
    </>
  );
}
