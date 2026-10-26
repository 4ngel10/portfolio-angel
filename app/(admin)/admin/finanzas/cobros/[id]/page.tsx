import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { cargarCobro } from "@/lib/portal/finanzas-queries";
import { hoyMadrid, resumenCobro } from "@/lib/portal/finanzas";
import { listarEmpresas, listarProyectos } from "@/lib/portal/queries";
import {
  anularCobro,
  eliminarCobro,
  eliminarPago,
  reactivarCobro,
} from "@/lib/portal/finanzas-actions";
import { isUuid } from "@/lib/portal/validate";
import { ConfirmSubmit } from "@/components/portal/confirm-submit";
import { FormCobro, FormPago } from "@/components/portal/finanzas-forms";
import {
  EmptyState,
  EstadoCobroBadge,
  OrigenBadge,
  PageHeader,
  Panel,
  ProgressBar,
} from "@/components/portal/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { t } = await getI18n();
  const { id } = await params;
  const datos = isUuid(id) ? await cargarCobro(id) : null;
  return {
    title: datos
      ? `${datos.cobro.numero} · ${datos.cobro.concepto}`
      : t("finance.collections.title"),
  };
}

export default async function CobroPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ editar?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const datos = await cargarCobro(id);
  if (!datos) notFound();

  const { t, fecha, euros } = await getI18n();
  const { cobro, pagos } = datos;
  const editando = (await searchParams).editar === "1";
  const hoy = hoyMadrid();
  const { pagado, pendiente, estado } = resumenCobro(cobro, pagos, hoy);
  const [empresas, proyectos] = await Promise.all([listarEmpresas(), listarProyectos()]);
  const empresa = empresas.find((e) => e.id === cobro.empresa_id);
  const proyecto = proyectos.find((p) => p.id === cobro.proyecto_id);

  return (
    <>
      <PageHeader
        title={cobro.concepto}
        intro={`${cobro.numero} · ${empresa?.nombre ?? ""}`}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <OrigenBadge origen={cobro.origen} />
            <EstadoCobroBadge estado={estado} />
          </div>
        }
      />

      <div className="mb-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel title={t("finance.collections.detail")}>
          <div className="mb-5">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {euros(pagado)}{" "}
                <span className="text-muted text-base font-normal">
                  {t("finance.collections.ofTotal", { total: euros(cobro.importe) })}
                </span>
              </p>
              <p className="text-muted text-sm tabular-nums">
                {t("finance.collections.pendingAmount", { amount: euros(pendiente) })}
              </p>
            </div>
            <ProgressBar
              value={pagado}
              max={cobro.importe}
              label={t("finance.collections.progress")}
            />
          </div>

          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">{t("finance.cols.client")}</dt>
              <dd>
                <Link
                  href={`/admin/clientes/${cobro.empresa_id}`}
                  className="hover:text-accent font-medium underline-offset-4 hover:underline"
                >
                  {empresa?.nombre}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("finance.cols.project")}</dt>
              <dd>
                {proyecto ? (
                  <Link
                    href={`/admin/proyectos/${proyecto.id}`}
                    className="hover:text-accent font-medium underline-offset-4 hover:underline"
                  >
                    {proyecto.titulo}
                  </Link>
                ) : (
                  "-"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("finance.cols.issued")}</dt>
              <dd>{fecha(cobro.fecha_emision)}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("finance.cols.due")}</dt>
              <dd>{cobro.fecha_vencimiento ? fecha(cobro.fecha_vencimiento) : "-"}</dd>
            </div>
            {cobro.presupuesto_id ? (
              <div>
                <dt className="text-muted">{t("finance.collections.fromQuote")}</dt>
                <dd>
                  <Link
                    href={`/admin/presupuestos/${cobro.presupuesto_id}`}
                    className="hover:text-accent font-medium underline-offset-4 hover:underline"
                  >
                    {t("finance.collections.openQuote")}
                  </Link>
                </dd>
              </div>
            ) : null}
            {cobro.notas ? (
              <div className="sm:col-span-2">
                <dt className="text-muted">{t("finance.form.notes")}</dt>
                <dd className="whitespace-pre-wrap">{cobro.notas}</dd>
              </div>
            ) : null}
          </dl>

          <div className="border-rule mt-6 flex flex-wrap gap-3 border-t pt-5">
            <Link
              href={
                editando ? `/admin/finanzas/cobros/${id}` : `/admin/finanzas/cobros/${id}?editar=1`
              }
              className="btn-secondary"
            >
              {editando ? t("common.cancel") : t("finance.collections.edit")}
            </Link>
            <form action={cobro.anulado ? reactivarCobro : anularCobro}>
              <input type="hidden" name="id" value={id} />
              {cobro.anulado ? (
                <button type="submit" className="btn-secondary">
                  {t("finance.collections.reactivate")}
                </button>
              ) : (
                <ConfirmSubmit
                  mensaje={t("finance.collections.confirmVoid")}
                  className="btn-secondary"
                >
                  {t("finance.collections.void")}
                </ConfirmSubmit>
              )}
            </form>
            {pagos.length === 0 ? (
              <form action={eliminarCobro}>
                <input type="hidden" name="id" value={id} />
                <ConfirmSubmit
                  mensaje={t("finance.collections.confirmDelete")}
                  className="btn-secondary"
                >
                  {t("finance.collections.delete")}
                </ConfirmSubmit>
              </form>
            ) : null}
          </div>
          {pagos.length > 0 ? (
            <p className="text-muted mt-3 text-xs">{t("finance.collections.cantDelete")}</p>
          ) : null}
        </Panel>

        <Panel title={t("finance.payment.registerTitle")}>
          {cobro.anulado ? (
            <EmptyState>{t("finance.payment.voidedNote")}</EmptyState>
          ) : pendiente <= 0 ? (
            <EmptyState>{t("finance.payment.paidNote")}</EmptyState>
          ) : (
            <FormPago cobroId={id} pendiente={pendiente} hoy={hoy} />
          )}
        </Panel>
      </div>

      {editando ? (
        <Panel title={t("finance.collections.edit")} className="mb-6">
          <FormCobro
            empresas={empresas.map((e) => ({ id: e.id, nombre: e.nombre }))}
            proyectos={proyectos.map((p) => ({
              id: p.id,
              nombre: p.titulo,
              empresa_id: p.empresa_id,
            }))}
            hoy={hoy}
            inicial={cobro}
          />
        </Panel>
      ) : null}

      <Panel title={t("finance.payment.title")}>
        {pagos.length === 0 ? (
          <EmptyState>{t("finance.payment.none")}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    {t("finance.cols.date")}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    {t("finance.cols.method")}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    {t("finance.cols.reference")}
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    {t("finance.cols.amount")}
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    <span className="sr-only">{t("finance.payment.delete")}</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {pagos.map((p) => (
                  <tr key={p.id}>
                    <th scope="row" className="py-2.5 pr-4 font-normal whitespace-nowrap">
                      {fecha(p.fecha)}
                    </th>
                    <td className="text-muted py-2.5 pr-4">{t(`finance.method.${p.metodo}`)}</td>
                    <td className="text-muted py-2.5 pr-4">{p.referencia ?? ""}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{euros(p.importe)}</td>
                    <td className="py-2.5 text-right">
                      <form action={eliminarPago}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmSubmit
                          mensaje={t("finance.payment.confirmDelete")}
                          className="text-muted hover:text-accent text-sm underline underline-offset-4"
                          label={t("finance.payment.delete")}
                        >
                          {t("finance.payment.delete")}
                        </ConfirmSubmit>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
