import type { Metadata } from "next";
import { requireCliente } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { listarLineasPresupuesto, listarPresupuestos } from "@/lib/portal/queries";
import { PageHeader } from "@/components/portal/ui";
import { ListaPresupuestos } from "@/components/portal/vistas-cliente";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("quotes.clientTitle") };
}

export default async function PresupuestosPage() {
  await requireCliente();
  const { t } = await getI18n();
  // RLS solo entrega los presupuestos enviados a su empresa.
  const [presupuestos, lineas] = await Promise.all([
    listarPresupuestos(),
    listarLineasPresupuesto(),
  ]);

  return (
    <>
      <PageHeader title={t("quotes.clientTitle")} intro={t("quotes.clientIntro")} />
      <Aparece>
        <ListaPresupuestos presupuestos={presupuestos} lineas={lineas} enlaces />
      </Aparece>
    </>
  );
}
