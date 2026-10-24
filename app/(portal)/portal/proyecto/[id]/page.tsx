import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCliente } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { cargarIncidencias } from "@/lib/portal/queries";
import { isUuid } from "@/lib/portal/validate";
import type { Archivo, Hito, Proyecto } from "@/lib/portal/types";
import { ArchivosLista, HitosLista, IncidenciasLista } from "@/components/portal/listas";
import { EstadoProyectoBadge, PageHeader, Panel, ProgressBar } from "@/components/portal/ui";
import { FileUploader } from "@/components/portal/file-uploader";
import { IncidenciaForm } from "@/components/portal/incidencia-form";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("common.project") };
}

export default async function ProyectoPage({ params }: { params: Promise<{ id: string }> }) {
  const perfil = await requireCliente();
  const { t } = await getI18n();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("proyectos").select("*").eq("id", id).maybeSingle();
  const proyecto = data as Proyecto | null;
  if (!proyecto) notFound(); // RLS no devuelve proyectos de otra empresa

  const [{ data: h }, { data: a }, inc] = await Promise.all([
    supabase.from("hitos").select("*").eq("proyecto_id", id).order("orden"),
    supabase
      .from("archivos")
      .select("*")
      .eq("proyecto_id", id)
      .order("created_at", { ascending: false }),
    cargarIncidencias({ proyectoId: id }),
  ]);
  const hitos = (h ?? []) as Hito[];
  const archivos = (a ?? []) as Archivo[];
  const hechos = hitos.filter((x) => x.completado).length;

  return (
    <>
      <p className="mb-4 text-sm">
        <Link
          href="/portal"
          className="text-muted hover:text-ink underline-offset-4 hover:underline"
        >
          {t("project.back")}
        </Link>
      </p>
      <PageHeader
        title={proyecto.titulo}
        intro={proyecto.descripcion ?? undefined}
        action={<EstadoProyectoBadge estado={proyecto.estado} />}
      />

      <div className="grid gap-6">
        <Aparece>
          <Panel title={t("project.progress")}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex-1">
                <ProgressBar
                  value={hechos}
                  max={hitos.length}
                  label={t("project.milestonesDone")}
                />
              </div>
              <span className="text-muted text-sm">
                {hitos.length
                  ? t("project.countOf", { done: hechos, total: hitos.length })
                  : t("project.noMilestonesShort")}
              </span>
            </div>
            <HitosLista hitos={hitos} />
          </Panel>
        </Aparece>

        <Aparece retraso={0.05}>
          <Panel title={t("project.files")}>
            <div className="mb-4">
              <FileUploader proyectoId={proyecto.id} />
            </div>
            <ArchivosLista archivos={archivos} />
          </Panel>
        </Aparece>

        <Aparece retraso={0.1}>
          <Panel title={t("project.incidents")}>
            <IncidenciasLista
              incidencias={inc.incidencias}
              mensajes={inc.mensajes}
              autores={inc.autores}
              proyectos={{}}
              perfilId={perfil.id}
              sinProyecto
              rutaProyecto="/portal/proyecto"
            />
            <div className="border-rule mt-6 border-t pt-5">
              <h3 className="mb-3 font-semibold">{t("project.openIncident")}</h3>
              <IncidenciaForm
                proyectos={[{ id: proyecto.id, titulo: proyecto.titulo }]}
                proyectoId={proyecto.id}
              />
            </div>
          </Panel>
        </Aparece>
      </div>
    </>
  );
}
