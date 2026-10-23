import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { cargarIncidencias } from "@/lib/portal/queries";
import { cambiarEstadoProyecto, crearHito } from "@/lib/portal/actions";
import { isUuid } from "@/lib/portal/validate";
import type { Archivo, Empresa, Hito, Proyecto } from "@/lib/portal/types";
import { ActionForm } from "@/components/portal/action-form";
import { ArchivosLista, HitosLista, IncidenciasLista } from "@/components/portal/listas";
import { FileUploader } from "@/components/portal/file-uploader";
import { inputCls, labelCls } from "@/components/portal/styles";
import { EstadoProyectoBadge, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("common.project") };
}

export default async function ProyectoAdminPage({ params }: { params: Promise<{ id: string }> }) {
  const perfil = await requireAdmin();
  const { t } = await getI18n();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("proyectos").select("*").eq("id", id).maybeSingle();
  const proyecto = data as Proyecto | null;
  if (!proyecto) notFound();

  const [{ data: e }, { data: h }, { data: a }, inc] = await Promise.all([
    supabase.from("empresas").select("*").eq("id", proyecto.empresa_id).maybeSingle(),
    supabase.from("hitos").select("*").eq("proyecto_id", id).order("orden"),
    supabase.from("archivos").select("*").eq("proyecto_id", id).order("created_at", { ascending: false }),
    cargarIncidencias({ proyectoId: id }),
  ]);
  const empresa = e as Empresa | null;
  const hitos = (h ?? []) as Hito[];
  const archivos = (a ?? []) as Archivo[];

  return (
    <>
      <p className="mb-4 text-sm">
        <Link href="/admin/proyectos" className="text-muted underline-offset-4 hover:text-ink hover:underline">
          {t("admin.backProjects")}
        </Link>
      </p>
      <PageHeader
        title={proyecto.titulo}
        intro={
          proyecto.descripcion
            ? t("admin.projectTitleDesc", { company: empresa?.nombre ?? "", desc: proyecto.descripcion })
            : empresa?.nombre
        }
        action={
          <form action={cambiarEstadoProyecto} className="flex items-center gap-2">
            <input type="hidden" name="id" value={proyecto.id} />
            <EstadoProyectoBadge estado={proyecto.estado} />
            <label htmlFor="estado" className="sr-only">{t("admin.stateAria")}</label>
            <select id="estado" name="estado" defaultValue={proyecto.estado} className={`${inputCls} !w-auto !py-1.5 text-sm`}>
              <option value="activo">{t("status.active")}</option>
              <option value="pausado">{t("status.paused")}</option>
              <option value="completado">{t("status.completed")}</option>
            </select>
            <button type="submit" className="btn-secondary !px-3.5 !py-1.5 !text-sm">{t("admin.change")}</button>
          </form>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className="grid content-start gap-6">
          <Panel title={t("admin.milestones")}>
            <HitosLista hitos={hitos} admin />
            <div className="mt-6 border-t border-rule pt-5">
              <h3 className="mb-3 font-semibold">{t("admin.addMilestone")}</h3>
              <ActionForm action={crearHito} submitLabel={t("admin.add")} pendingLabel={t("admin.adding")} secondary>
                <input type="hidden" name="proyecto_id" value={proyecto.id} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="h-titulo" className={labelCls}>{t("common.titleLabel")}</label>
                    <input id="h-titulo" name="titulo" required maxLength={120} className={inputCls} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="h-desc" className={labelCls}>{t("common.description")}</label>
                    <input id="h-desc" name="descripcion" maxLength={1000} className={inputCls} />
                  </div>
                  <div>
                    <label htmlFor="h-pelota" className={labelCls}>{t("admin.ballIn")}</label>
                    <select id="h-pelota" name="pelota_en" defaultValue="equipo" className={inputCls}>
                      <option value="equipo">{t("admin.theTeam")}</option>
                      <option value="cliente">{t("admin.theClient")}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="h-fecha" className={labelCls}>{t("admin.targetDate")}</label>
                    <input id="h-fecha" name="fecha_objetivo" type="date" className={inputCls} />
                  </div>
                </div>
              </ActionForm>
            </div>
          </Panel>

          <Panel title={t("project.files")} action={<FileUploader proyectoId={proyecto.id} />}>
            <ArchivosLista archivos={archivos} admin />
          </Panel>
        </div>

        <Panel title={t("project.incidents")}>
          <IncidenciasLista
            incidencias={inc.incidencias}
            mensajes={inc.mensajes}
            autores={inc.autores}
            proyectos={{}}
            perfilId={perfil.id}
            admin
            sinProyecto
            rutaProyecto="/admin/proyectos"
          />
        </Panel>
      </div>
    </>
  );
}
