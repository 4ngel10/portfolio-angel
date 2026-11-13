import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import Link from "next/link";
import {
  listarBolsas,
  listarEmpresas,
  listarHistorialBolsas,
  listarMovimientos,
  listarProyectos,
} from "@/lib/portal/queries";
import { guardarBolsa, registrarHoras } from "@/lib/portal/actions";
import { ActionForm } from "@/components/portal/action-form";
import { BotonCobroBolsa } from "@/components/portal/finanzas-forms";
import { inputCls, labelCls } from "@/components/portal/styles";
import { EmptyState, PageHeader, Panel, ProgressBar } from "@/components/portal/ui";
import { MovimientosLista } from "@/components/portal/movimientos";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.hoursTitle") };
}

export default async function HorasAdminPage() {
  await requireAdmin();
  const { t, euros, fecha, horas, num } = await getI18n();
  const [empresas, bolsas, historial, proyectos, movimientos] = await Promise.all([
    listarEmpresas(),
    listarBolsas(),
    listarHistorialBolsas(),
    listarProyectos(),
    listarMovimientos({ limit: 500 }),
  ]);
  const hoy = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(new Date());
  const titulos = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));

  return (
    <>
      <PageHeader title={t("admin.hoursTitle")} intro={t("admin.hoursIntro")} />

      {empresas.length === 0 ? (
        <EmptyState>{t("admin.createCompanyFirst")}</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {empresas.map((e) => {
            const b = bolsas.find((x) => x.empresa_id === e.id);
            // Gasto acumulado: lo archivado de los meses antiguos (cuando la bolsa se reiniciaba)
            // más el precio de la bolsa actual. Solo lo ve el admin.
            const cerrados = historial.filter((h) => h.empresa_id === e.id);
            const acumulado = cerrados.reduce((sum, h) => sum + (h.precio ?? 0), b?.precio ?? 0);
            const restantes = b
              ? Math.max(0, Math.round((b.horas_contratadas - b.horas_consumidas) * 100) / 100)
              : 0;
            const suyos = proyectos.filter((p) => p.empresa_id === e.id);
            const ultimos = movimientos.filter((m) => m.empresa_id === e.id).slice(0, 5);
            return (
              <Panel key={e.id} title={e.nombre}>
                {b ? (
                  <>
                    <p className="text-2xl font-semibold tracking-tight">
                      {num(restantes)}
                      <span className="text-muted ml-1 text-sm font-normal">
                        {t("admin.availableOf", { total: num(b.horas_contratadas) })}
                      </span>
                    </p>
                    <dl className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-muted">{t("admin.bankPrice")}</dt>
                        <dd className="font-semibold">
                          {b.precio !== null ? euros(b.precio) : t("admin.noPrice")}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted">{t("admin.totalSpent")}</dt>
                        <dd className="font-semibold">{euros(acumulado)}</dd>
                      </div>
                    </dl>
                    <div className="mt-3">
                      <ProgressBar
                        value={b.horas_consumidas}
                        max={b.horas_contratadas}
                        label={`${t("admin.hoursConsumed")}: ${e.nombre}`}
                      />
                    </div>

                    {b.precio ? (
                      <div className="mt-4">
                        <BotonCobroBolsa bolsaId={b.id} />
                      </div>
                    ) : null}

                    <ActionForm
                      action={registrarHoras}
                      submitLabel={t("admin.record")}
                      pendingLabel={t("admin.saving")}
                      className="mt-5"
                    >
                      <input type="hidden" name="empresa_id" value={e.id} />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`d-${e.id}`} className={labelCls}>
                            {t("admin.workDate")}
                          </label>
                          <input
                            id={`d-${e.id}`}
                            name="fecha"
                            type="date"
                            required
                            defaultValue={hoy}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label htmlFor={`h-${e.id}`} className={labelCls}>
                            {t("admin.hoursLabel")}
                          </label>
                          <input
                            id={`h-${e.id}`}
                            name="horas"
                            type="number"
                            step="0.25"
                            min={-1000}
                            max={1000}
                            required
                            placeholder="1,5"
                            className={inputCls}
                          />
                        </div>
                      </div>
                      <label htmlFor={`pr-${e.id}`} className={`${labelCls} mt-3`}>
                        {t("admin.projectOptional")}
                      </label>
                      <select
                        id={`pr-${e.id}`}
                        name="proyecto_id"
                        defaultValue=""
                        className={inputCls}
                      >
                        <option value="">{t("admin.noProject")}</option>
                        {suyos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.titulo}
                          </option>
                        ))}
                      </select>
                      <label htmlFor={`co-${e.id}`} className={`${labelCls} mt-3`}>
                        {t("admin.concept")}
                      </label>
                      <input
                        id={`co-${e.id}`}
                        name="concepto"
                        type="text"
                        required
                        maxLength={200}
                        placeholder={t("admin.conceptPlaceholder")}
                        className={inputCls}
                      />
                      <p className="text-muted mt-1.5 text-xs">{t("admin.correctionHint")}</p>
                    </ActionForm>

                    <div className="border-rule mt-5 border-t pt-4">
                      <div className="mb-1 flex items-baseline justify-between gap-3">
                        <h3 className="text-sm font-semibold">{t("admin.recentMovements")}</h3>
                        <Link
                          href={`/admin/clientes/${e.id}`}
                          className="hover:text-accent text-sm underline underline-offset-4"
                        >
                          {t("admin.viewAll")}
                        </Link>
                      </div>
                      {ultimos.length === 0 ? (
                        <p className="text-muted text-sm">{t("admin.noMovements")}</p>
                      ) : (
                        <MovimientosLista
                          movimientos={ultimos}
                          proyectos={titulos}
                          t={t}
                          fecha={fecha}
                          horas={horas}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-muted mb-3 text-sm">{t("admin.noContracted")}</p>
                )}

                <ActionForm
                  action={guardarBolsa}
                  submitLabel={b ? t("admin.changeContracted") : t("admin.createBank")}
                  pendingLabel={t("admin.saving")}
                  secondary
                  className="border-rule mt-5 border-t pt-5"
                >
                  <input type="hidden" name="empresa_id" value={e.id} />
                  <label htmlFor={`c-${e.id}`} className={labelCls}>
                    {t("admin.contractedTotal")}
                  </label>
                  <input
                    id={`c-${e.id}`}
                    name="horas_contratadas"
                    type="number"
                    step="0.25"
                    min={0}
                    max={10000}
                    required
                    defaultValue={b?.horas_contratadas}
                    className={`${inputCls} sm:max-w-[140px]`}
                  />
                  <label htmlFor={`p-${e.id}`} className={`${labelCls} mt-3`}>
                    {t("admin.priceLabel")}
                  </label>
                  <input
                    id={`p-${e.id}`}
                    name="precio"
                    type="number"
                    step="0.01"
                    min={0}
                    max={1000000}
                    defaultValue={b?.precio ?? undefined}
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
