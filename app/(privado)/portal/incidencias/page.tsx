import type { Metadata } from "next";
import { requireCliente } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { cargarIncidencias, listarProyectos, mapaTitulos } from "@/lib/portal/queries";
import { IncidenciasLista } from "@/components/portal/listas";
import { PageHeader, Panel } from "@/components/portal/ui";
import { IncidenciaForm } from "@/components/portal/incidencia-form";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("incidentsPage.title") };
}

export default async function IncidenciasPage() {
  const perfil = await requireCliente();
  const { t } = await getI18n();
  const [proyectos, inc] = await Promise.all([listarProyectos(), cargarIncidencias()]);

  return (
    <>
      <PageHeader title={t("incidentsPage.title")} intro={t("incidentsPage.intro")} />
      <div className="grid gap-6">
        <Aparece>
          <Panel title={t("incidentsPage.openTitle")}>
            <IncidenciaForm proyectos={proyectos.map((p) => ({ id: p.id, titulo: p.titulo }))} />
          </Panel>
        </Aparece>
        <Aparece retraso={0.05}>
          <Panel title={t("incidentsPage.yours")}>
            <IncidenciasLista
              incidencias={inc.incidencias}
              mensajes={inc.mensajes}
              autores={inc.autores}
              proyectos={mapaTitulos(proyectos)}
              perfilId={perfil.id}
              rutaProyecto="/portal/proyecto"
            />
          </Panel>
        </Aparece>
      </div>
    </>
  );
}
