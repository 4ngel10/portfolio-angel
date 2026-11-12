import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { listarEmpresas } from "@/lib/portal/queries";
import { PresupuestoForm } from "@/components/portal/presupuesto-form";
import { EmptyState, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("quotes.new") };
}

export default async function NuevoPresupuestoPage() {
  await requireAdmin();
  const { t } = await getI18n();
  const empresas = await listarEmpresas();
  // Fecha de hoy en España: el servidor corre en UTC y de madrugada saldría el día anterior.
  const hoy = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });

  return (
    <>
      <PageHeader title={t("quotes.new")} intro={t("quotes.newIntro")} />
      {empresas.length === 0 ? (
        <EmptyState>{t("admin.createCompanyFirst")}</EmptyState>
      ) : (
        <Panel>
          <PresupuestoForm
            empresas={empresas.map((e) => ({ id: e.id, nombre: e.nombre }))}
            hoy={hoy}
          />
        </Panel>
      )}
    </>
  );
}
