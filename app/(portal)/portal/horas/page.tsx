import type { Metadata } from "next";
import { requireCliente } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { listarBolsas, listarMovimientos, listarProyectos } from "@/lib/portal/queries";
import { PageHeader } from "@/components/portal/ui";
import { BolsaDeHoras } from "@/components/portal/vistas-cliente";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("hoursPage.title") };
}

export default async function HorasPage() {
  await requireCliente();
  const { t } = await getI18n();
  const [bolsas, movimientos, proyectos] = await Promise.all([
    listarBolsas(),
    listarMovimientos(),
    listarProyectos(),
  ]);

  return (
    <>
      <PageHeader title={t("hoursPage.title")} intro={t("hoursPage.intro")} />
      <Aparece>
        <BolsaDeHoras bolsa={bolsas[0]} movimientos={movimientos} proyectos={proyectos} />
      </Aparece>
    </>
  );
}
