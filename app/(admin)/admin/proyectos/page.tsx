import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { listarEmpresas, listarHitos, listarProyectos, progreso } from "@/lib/portal/queries";
import { crearProyecto } from "@/lib/portal/actions";
import { ActionForm } from "@/components/portal/action-form";
import { inputCls, labelCls } from "@/components/portal/styles";
import { EmptyState, EstadoProyectoBadge, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.projectsTitle") };
}

export default async function ProyectosAdminPage() {
  await requireAdmin();
  const { t, fecha } = await getI18n();
  const [proyectos, empresas, hitos] = await Promise.all([listarProyectos(), listarEmpresas(), listarHitos()]);
  const nombre = Object.fromEntries(empresas.map((e) => [e.id, e.nombre]));

  return (
    <>
      <PageHeader title={t("admin.projectsTitle")} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title={t("admin.allProjects")}>
          {proyectos.length === 0 ? (
            <EmptyState>{t("admin.noProjects")}</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th scope="col" className="py-2 pr-4 font-medium">{t("admin.colProject")}</th>
                    <th scope="col" className="py-2 pr-4 font-medium">{t("admin.colCompany")}</th>
                    <th scope="col" className="py-2 pr-4 font-medium">{t("admin.colMilestones")}</th>
                    <th scope="col" className="py-2 pr-4 font-medium">{t("admin.colStatus")}</th>
                    <th scope="col" className="py-2 font-medium">{t("admin.colSince")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {proyectos.map((p) => {
                    const { hechos, total } = progreso(hitos, p.id);
                    return (
                      <tr key={p.id}>
                        <td className="py-2.5 pr-4">
                          <Link href={`/admin/proyectos/${p.id}`} className="font-medium underline-offset-4 hover:text-accent hover:underline">
                            {p.titulo}
                          </Link>
                        </td>
                        <td className="py-2.5 pr-4 text-muted">{nombre[p.empresa_id]}</td>
                        <td className="py-2.5 pr-4 tabular-nums">{hechos}/{total}</td>
                        <td className="py-2.5 pr-4"><EstadoProyectoBadge estado={p.estado} /></td>
                        <td className="py-2.5 text-muted">{fecha(p.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title={t("admin.newProject")}>
          <ActionForm action={crearProyecto} submitLabel={t("admin.createProject")} pendingLabel={t("admin.creating")}>
            <div className="grid gap-3">
              <div>
                <label htmlFor="pr-empresa" className={labelCls}>{t("common.company")}</label>
                <select id="pr-empresa" name="empresa_id" required defaultValue="" className={inputCls}>
                  <option value="" disabled>{t("common.chooseCompany")}</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pr-titulo" className={labelCls}>{t("common.titleLabel")}</label>
                <input id="pr-titulo" name="titulo" required minLength={3} maxLength={120} className={inputCls} />
              </div>
              <div>
                <label htmlFor="pr-desc" className={labelCls}>{t("common.description")}</label>
                <textarea id="pr-desc" name="descripcion" rows={3} maxLength={2000} className={inputCls} />
              </div>
            </div>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
