import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { listarEmpresas, listarProyectos } from "@/lib/portal/queries";
import { crearEmpresa, invitarCliente } from "@/lib/portal/actions";
import { ActionForm } from "@/components/portal/action-form";
import { inputCls, labelCls } from "@/components/portal/styles";
import { EmptyState, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.clientsTitle") };
}

export default async function ClientesPage() {
  await requireAdmin();
  const { t, fecha } = await getI18n();
  const supabase = await createClient();
  const [empresas, proyectos, { data: usuarios }] = await Promise.all([
    listarEmpresas(),
    listarProyectos(),
    supabase.from("usuarios").select("id, empresa_id").eq("role", "cliente"),
  ]);

  const contar = (arr: { empresa_id: string | null }[] | null | undefined, id: string) =>
    (arr ?? []).filter((x) => x.empresa_id === id).length;

  return (
    <>
      <PageHeader title={t("admin.clientsTitle")} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel title={t("admin.companies")}>
          {empresas.length === 0 ? (
            <EmptyState>{t("admin.noCompanies")}</EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th scope="col" className="py-2 pr-4 font-medium">{t("admin.colCompany")}</th>
                    <th scope="col" className="py-2 pr-4 font-medium">{t("admin.colPeople")}</th>
                    <th scope="col" className="py-2 pr-4 font-medium">{t("admin.colProjects")}</th>
                    <th scope="col" className="py-2 font-medium">{t("admin.colSince")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {empresas.map((e) => (
                    <tr key={e.id}>
                      <td className="py-2.5 pr-4">
                        <Link href={`/admin/clientes/${e.id}`} className="font-medium underline-offset-4 hover:text-accent hover:underline">
                          {e.nombre}
                        </Link>
                      </td>
                      <td className="py-2.5 pr-4 tabular-nums">{contar(usuarios, e.id)}</td>
                      <td className="py-2.5 pr-4 tabular-nums">{contar(proyectos, e.id)}</td>
                      <td className="py-2.5 text-muted">{fecha(e.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="grid content-start gap-6">
          <Panel title={t("admin.newCompany")}>
            <ActionForm action={crearEmpresa} submitLabel={t("admin.createCompany")} pendingLabel={t("admin.creating")}>
              <label htmlFor="emp-nombre" className={labelCls}>{t("common.name")}</label>
              <input id="emp-nombre" name="nombre" required maxLength={80} className={inputCls} />
            </ActionForm>
          </Panel>

          <Panel title={t("admin.registerPerson")}>
            <ActionForm action={invitarCliente} submitLabel={t("admin.register")} pendingLabel={t("admin.creating")}>
              <div className="grid gap-3">
                <div>
                  <label htmlFor="cli-empresa" className={labelCls}>{t("common.company")}</label>
                  <select id="cli-empresa" name="empresa_id" required defaultValue="" className={inputCls}>
                    <option value="" disabled>{t("common.chooseCompany")}</option>
                    {empresas.map((e) => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="cli-nombre" className={labelCls}>{t("common.name")}</label>
                  <input id="cli-nombre" name="nombre" required maxLength={80} autoComplete="off" className={inputCls} />
                </div>
                <div>
                  <label htmlFor="cli-email" className={labelCls}>{t("common.email")}</label>
                  <input id="cli-email" name="email" type="email" required autoComplete="off" spellCheck={false} className={inputCls} />
                </div>
              </div>
            </ActionForm>
            <p className="mt-3 text-xs text-muted">{t("admin.registerHint")}</p>
          </Panel>
        </div>
      </div>
    </>
  );
}
