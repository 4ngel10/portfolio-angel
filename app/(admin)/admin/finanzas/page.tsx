import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import {
  cobrosConEstado,
  listarGastos,
  listarPagos,
  listarSuscripciones,
} from "@/lib/portal/finanzas-queries";
import { listarEmpresas } from "@/lib/portal/queries";
import {
  PERIODOS,
  costeMensual,
  diasEntre,
  hoyMadrid,
  porCategoria,
  rangoPeriodo,
  serieMensual,
  sumarDias,
} from "@/lib/portal/finanzas";
import { redondear } from "@/lib/portal/presupuestos";
import { oneOf } from "@/lib/portal/validate";
import {
  BarrasCategoria,
  BarrasMensuales,
  EnlaceCsv,
  KpiTile,
  PeriodoSelector,
} from "@/components/portal/finanzas-ui";
import { EmptyState, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("finance.summary.title") };
}

export default async function ResumenFinanzasPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  await requireAdmin();
  const { t, fecha, euros } = await getI18n();
  const hoy = hoyMadrid();
  const periodo = oneOf((await searchParams).periodo, PERIODOS) ?? "mes";
  const { desde, hasta } = rangoPeriodo(periodo, hoy);

  const [cobros, pagos, gastos, suscripciones, empresas] = await Promise.all([
    cobrosConEstado(),
    listarPagos(),
    listarGastos(),
    listarSuscripciones(),
    listarEmpresas(),
  ]);
  const nombre = Object.fromEntries(empresas.map((e) => [e.id, e.nombre]));

  const enPeriodo = <T extends { fecha: string }>(filas: T[]) =>
    filas.filter((f) => f.fecha >= desde && f.fecha <= hasta);
  const pagosPeriodo = enPeriodo(pagos);
  const gastosPeriodo = enPeriodo(gastos);

  // Caja: el ingreso cuenta cuando se cobra; lo pendiente es siempre el total vivo.
  const cobrado = redondear(pagosPeriodo.reduce((s, p) => s + p.importe, 0));
  const gastado = redondear(gastosPeriodo.reduce((s, g) => s + g.importe, 0));
  const resultado = redondear(cobrado - gastado);
  const abiertos = cobros.filter((c) => ["pendiente", "parcial", "vencido"].includes(c.estado));
  const pendiente = redondear(abiertos.reduce((s, c) => s + c.pendiente, 0));
  const vencidos = abiertos
    .filter((c) => c.estado === "vencido")
    .map((c) => ({ ...c, dias: diasEntre(c.cobro.fecha_vencimiento!, hoy) }))
    .sort((a, b) => b.dias - a.dias);
  const vencido = redondear(vencidos.reduce((s, c) => s + c.pendiente, 0));

  const activas = suscripciones.filter((s) => s.activa);
  const costeFijo = redondear(activas.reduce((s, x) => s + costeMensual(x), 0));
  const limite = sumarDias(hoy, 30);
  const renovaciones = activas
    .filter((s) => s.proxima_renovacion <= limite)
    .sort((a, b) => a.proxima_renovacion.localeCompare(b.proxima_renovacion));

  const categorias = porCategoria(gastosPeriodo);
  const signo = resultado > 0 ? "+" : "";

  return (
    <>
      <PageHeader
        title={t("finance.summary.title")}
        intro={t("finance.summary.intro")}
        action={<PeriodoSelector actual={periodo} />}
      />

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <KpiTile label={t("finance.summary.collected")} value={euros(cobrado)} />
        <KpiTile label={t("finance.summary.spent")} value={euros(gastado)} />
        <KpiTile label={t("finance.summary.result")} value={`${signo}${euros(resultado)}`} />
        <KpiTile
          label={t("finance.summary.pending")}
          value={euros(pendiente)}
          hint={t("finance.summary.liveHint")}
        />
        <KpiTile label={t("finance.summary.overdue")} value={euros(vencido)} aviso={vencido > 0} />
        <KpiTile label={t("finance.summary.fixedCost")} value={euros(costeFijo)} />
      </dl>

      <Panel title={t("finance.summary.chartTitle")} className="mb-6">
        <BarrasMensuales serie={serieMensual(pagos, gastos, hoy)} />
      </Panel>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel title={t("finance.summary.overdueTitle")}>
          {vencidos.length === 0 ? (
            <EmptyState>{t("finance.summary.noOverdue")}</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--rule)]">
              {vencidos.map(({ cobro, pendiente: resta, dias }) => (
                <li key={cobro.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/admin/finanzas/cobros/${cobro.id}`}
                      className="hover:text-accent min-w-0 font-medium underline-offset-4 hover:underline"
                    >
                      {cobro.concepto}
                    </Link>
                    <span className="font-medium tabular-nums">{euros(resta)}</span>
                  </div>
                  <p className="text-muted mt-0.5 text-xs">
                    {nombre[cobro.empresa_id]} ·{" "}
                    <span className="text-[var(--accent)]">
                      {t("finance.summary.daysOverdue", { count: dias })}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title={t("finance.summary.renewalsTitle")}>
          {renovaciones.length === 0 ? (
            <EmptyState>{t("finance.summary.noRenewals")}</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--rule)]">
              {renovaciones.map((s) => (
                <li
                  key={s.id}
                  className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{s.nombre}</p>
                    <p className="text-muted mt-0.5 text-xs">
                      {fecha(s.proxima_renovacion)} · {t(`finance.period.${s.periodicidad}`)}
                    </p>
                    {s.url_gestion ? (
                      <a
                        href={s.url_gestion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent text-xs underline underline-offset-4"
                      >
                        {t("finance.subscriptions.manage")}
                      </a>
                    ) : null}
                  </div>
                  <span className="font-medium tabular-nums">{euros(s.importe)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("finance.summary.byCategory")}>
          {categorias.length === 0 ? (
            <EmptyState>{t("finance.summary.noExpenses")}</EmptyState>
          ) : (
            <BarrasCategoria filas={categorias} />
          )}
        </Panel>

        <Panel title={t("finance.summary.export")}>
          <p className="text-muted mb-4 text-sm">
            {t("finance.summary.exportHint", { from: fecha(desde), to: fecha(hasta) })}
          </p>
          <div className="flex flex-wrap gap-3">
            <EnlaceCsv tipo="pagos" desde={desde} hasta={hasta}>
              {t("finance.export.payments")}
            </EnlaceCsv>
            <EnlaceCsv tipo="cobros" desde={desde} hasta={hasta}>
              {t("finance.export.collections")}
            </EnlaceCsv>
            <EnlaceCsv tipo="gastos" desde={desde} hasta={hasta}>
              {t("finance.export.expenses")}
            </EnlaceCsv>
          </div>
        </Panel>
      </div>
    </>
  );
}
