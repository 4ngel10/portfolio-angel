import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { listarBolsas, listarEmpresas } from "@/lib/portal/queries";
import { guardarBolsa, registrarHoras } from "@/lib/portal/actions";
import { ActionForm } from "@/components/portal/action-form";
import { inputCls, labelCls } from "@/components/portal/styles";
import { EmptyState, PageHeader, Panel, ProgressBar } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.hoursTitle") };
}

export default async function HorasAdminPage() {
  await requireAdmin();
  const { t, fecha } = await getI18n();
  const [empresas, bolsas] = await Promise.all([listarEmpresas(), listarBolsas()]);

  return (
    <>
      <PageHeader title={t("admin.hoursTitle")} intro={t("admin.hoursIntro")} />

      {empresas.length === 0 ? (
        <EmptyState>{t("admin.createCompanyFirst")}</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {empresas.map((e) => {
            const b = bolsas.find((x) => x.empresa_id === e.id);
            const restantes = b ? Math.max(0, b.horas_contratadas - b.horas_consumidas) : 0;
            return (
              <Panel key={e.id} title={e.nombre}>
                {b ? (
                  <>
                    <p className="text-2xl font-semibold tracking-tight">
                      {restantes}
                      <span className="ml-1 text-sm font-normal text-muted">
                        {t("admin.availableUntil", { total: b.horas_contratadas, date: fecha(b.periodo_fin) })}
                      </span>
                    </p>
                    <div className="mt-3">
                      <ProgressBar value={b.horas_consumidas} max={b.horas_contratadas} label={`${t("admin.hoursConsumed")}: ${e.nombre}`} />
                    </div>

                    <ActionForm action={registrarHoras} submitLabel={t("admin.record")} pendingLabel={t("admin.saving")} className="mt-5">
                      <input type="hidden" name="empresa_id" value={e.id} />
                      <label htmlFor={`h-${e.id}`} className={labelCls}>{t("admin.hoursConsumed")}</label>
                      <input
                        id={`h-${e.id}`}
                        name="horas"
                        type="number"
                        step={1}
                        min={-1000}
                        max={1000}
                        required
                        placeholder="2"
                        className={`${inputCls} sm:max-w-[140px]`}
                      />
                      <p className="mt-1.5 text-xs text-muted">{t("admin.correctionHint")}</p>
                    </ActionForm>
                  </>
                ) : (
                  <p className="mb-3 text-sm text-muted">{t("admin.noContracted")}</p>
                )}

                <ActionForm
                  action={guardarBolsa}
                  submitLabel={b ? t("admin.changeContracted") : t("admin.createBank")}
                  pendingLabel={t("admin.saving")}
                  secondary
                  className="mt-5 border-t border-rule pt-5"
                >
                  <input type="hidden" name="empresa_id" value={e.id} />
                  <label htmlFor={`c-${e.id}`} className={labelCls}>{t("admin.contractedPerMonth")}</label>
                  <input
                    id={`c-${e.id}`}
                    name="horas_contratadas"
                    type="number"
                    step={1}
                    min={0}
                    max={10000}
                    required
                    defaultValue={b?.horas_contratadas}
                    className={`${inputCls} sm:max-w-[140px]`}
                  />
                </ActionForm>
              </Panel>
            );
          })}
        </div>
      )}
    </>
  );
}
