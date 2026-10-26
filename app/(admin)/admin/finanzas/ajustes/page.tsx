import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { cargarAjustes } from "@/lib/portal/finanzas-queries";
import { FormAjustes } from "@/components/portal/finanzas-forms";
import { PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("finance.settings.title") };
}

export default async function AjustesFinanzasPage() {
  await requireAdmin();
  const { t } = await getI18n();
  const ajustes = await cargarAjustes();
  return (
    <>
      <PageHeader title={t("finance.settings.title")} intro={t("finance.settings.intro")} />
      <Panel className="max-w-2xl">
        <FormAjustes
          fiscal={ajustes.config_fiscal}
          nombreComercial={ajustes.nombre_comercial ?? ""}
        />
      </Panel>
    </>
  );
}
