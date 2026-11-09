import type { Metadata } from "next";
import { requireCliente } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { listarBolsas, listarMovimientos, listarProyectos } from "@/lib/portal/queries";
import { MovimientosPorMes } from "@/components/portal/movimientos";
import { EmptyState, PageHeader, Panel, ProgressBar } from "@/components/portal/ui";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("hoursPage.title") };
}

export default async function HorasPage() {
  await requireCliente();
  const { t, euros, fecha, horas, num, mes } = await getI18n();
  const [bolsas, movimientos, proyectos] = await Promise.all([
    listarBolsas(),
    listarMovimientos(),
    listarProyectos(),
  ]);
  const bolsa = bolsas[0];
  const titulos = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));

  return (
    <>
      <PageHeader title={t("hoursPage.title")} intro={t("hoursPage.intro")} />
      <Aparece>
        <Panel>
          {!bolsa ? (
            <EmptyState>{t("hoursPage.none")}</EmptyState>
          ) : (
            <>
              <p className="text-5xl font-semibold tracking-tight">
                {num(
                  Math.max(
                    0,
                    Math.round((bolsa.horas_contratadas - bolsa.horas_consumidas) * 100) / 100,
                  ),
                )}
                <span className="text-muted ml-2 text-lg font-normal">
                  {t("hoursPage.available")}
                </span>
              </p>
              <div className="mt-5 max-w-xl">
                <ProgressBar
                  value={bolsa.horas_consumidas}
                  max={bolsa.horas_contratadas}
                  label={t("home.consumedHours")}
                />
              </div>
              <dl className="mt-6 grid max-w-xl grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted">{t("hoursPage.contracted")}</dt>
                  <dd className="mt-0.5 text-lg font-semibold">{horas(bolsa.horas_contratadas)}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t("hoursPage.consumed")}</dt>
                  <dd className="mt-0.5 text-lg font-semibold">{horas(bolsa.horas_consumidas)}</dd>
                </div>
                {bolsa.precio !== null ? (
                  <div>
                    <dt className="text-muted">{t("hoursPage.price")}</dt>
                    <dd className="mt-0.5 text-lg font-semibold">{euros(bolsa.precio)}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          )}
        </Panel>
      </Aparece>

      {bolsa ? (
        <Aparece>
          <Panel title={t("hoursPage.movements")} className="mt-6">
            {movimientos.length === 0 ? (
              <EmptyState>{t("hoursPage.noMovements")}</EmptyState>
            ) : (
              <MovimientosPorMes
                movimientos={movimientos}
                proyectos={titulos}
                mesLabel={mes}
                t={t}
                fecha={fecha}
                horas={horas}
              />
            )}
          </Panel>
        </Aparece>
      ) : null}
    </>
  );
}
