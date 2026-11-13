import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { estadoDe, listarProyectosAdmin, paraValidar } from "@/lib/proyectos-admin";
import { proyectoTieneIngles } from "@/lib/proyectos-types";
import { validarProyecto } from "@/lib/proyectos-validate";
import { EmptyState, PageHeader, Panel } from "@/components/portal/ui";
import { PortfolioLista, type FilaLista } from "@/components/portal/portfolio-lista";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("portfolio.title") };
}

export default async function AdminPortfolioPage() {
  await requireAdmin();
  const { t, fecha } = await getI18n();
  const proyectos = await listarProyectosAdmin();
  const ahora = Date.now();

  const estadoTexto = {
    borrador: t("portfolio.status.draft"),
    programado: t("portfolio.status.scheduled"),
    publicado: t("portfolio.status.published"),
  };
  const servicioTexto = { web: t("portfolio.service.web"), sistemas: t("portfolio.service.sistemas") };

  const filas: FilaLista[] = proyectos.map((p) => {
    const r = validarProyecto(paraValidar(p), { publicar: true });
    return {
      id: p.id,
      slug: p.slug,
      titulo: p.content.es.title,
      tag: p.content.es.tag,
      servicio: servicioTexto[p.service],
      enServicios: p.en_servicios.map((s) => `/servicios/${s}`).join(", "),
      estado: estadoDe(p, ahora),
      estadoTexto: estadoTexto[estadoDe(p, ahora)],
      fecha: p.published_at ? fecha(p.published_at) : "",
      image: p.image,
      cover: p.cover,
      errores: r.errores.length,
      provisional: p.datos_provisionales,
      ejemplo: p.ejemplo,
      sinIngles: !proyectoTieneIngles(p),
      sinOg: !p.og_image,
    };
  });

  return (
    <>
      <PageHeader
        title={t("portfolio.title")}
        intro={t("portfolio.intro")}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <a href="/api/admin/portfolio/exportar" className="btn-secondary" download>
              {t("portfolio.exportAll")}
            </a>
            <Link href="/admin/portfolio/nuevo" className="btn-primary">
              {t("portfolio.newProject")}
            </Link>
          </div>
        }
      />

      {filas.length === 0 ? (
        <EmptyState>{t("portfolio.empty")}</EmptyState>
      ) : (
        <Panel>
          <PortfolioLista filas={filas} />
        </Panel>
      )}
    </>
  );
}
