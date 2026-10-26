import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { cobrosConEstado } from "@/lib/portal/finanzas-queries";
import { hoyMadrid } from "@/lib/portal/finanzas";
import { listarEmpresas, listarProyectos } from "@/lib/portal/queries";
import { redondear } from "@/lib/portal/presupuestos";
import { isUuid, oneOf } from "@/lib/portal/validate";
import type { EstadoCobro } from "@/lib/portal/types";
import { EnlaceCsv } from "@/components/portal/finanzas-ui";
import { FormCobro } from "@/components/portal/finanzas-forms";
import { inputCls, labelCls } from "@/components/portal/styles";
import { EmptyState, EstadoCobroBadge, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("finance.collections.title") };
}

const ESTADOS: readonly EstadoCobro[] = ["pendiente", "parcial", "vencido", "pagado", "anulado"];

export default async function CobrosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; cliente?: string; anio?: string; empresa?: string }>;
}) {
  await requireAdmin();
  const { t, fecha, euros } = await getI18n();
  const q = await searchParams;
  const hoy = hoyMadrid();
  const estado = oneOf(q.estado, ESTADOS);
  const cliente = isUuid(q.cliente) ? q.cliente : "";
  const anio = /^\d{4}$/.test(q.anio ?? "") ? (q.anio as string) : "";
  const empresaNuevo = isUuid(q.empresa) ? q.empresa : "";

  const [todos, empresas, proyectos] = await Promise.all([
    cobrosConEstado(),
    listarEmpresas(),
    listarProyectos(),
  ]);
  const nombre = Object.fromEntries(empresas.map((e) => [e.id, e.nombre]));
  const titulo = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));
  const anios = [
    ...new Set([hoy.slice(0, 4), ...todos.map((c) => c.cobro.fecha_emision.slice(0, 4))]),
  ].sort((a, b) => b.localeCompare(a));

  const filas = todos.filter(
    (c) =>
      (!estado || c.estado === estado) &&
      (!cliente || c.cobro.empresa_id === cliente) &&
      (!anio || c.cobro.fecha_emision.startsWith(anio)),
  );
  const suma = (campo: "importe" | "pagado" | "pendiente") =>
    redondear(filas.reduce((s, c) => s + (campo === "importe" ? c.cobro.importe : c[campo]), 0));
  const hayFiltros = Boolean(estado || cliente || anio);

  return (
    <>
      <PageHeader
        title={t("finance.collections.title")}
        intro={t("finance.collections.intro")}
        action={
          <div className="flex flex-wrap gap-3">
            <EnlaceCsv
              tipo="cobros"
              desde={anio ? `${anio}-01-01` : undefined}
              hasta={anio ? `${anio}-12-31` : undefined}
            >
              {t("finance.export.csv")}
            </EnlaceCsv>
            <a href="#nuevo" className="btn-primary">
              {t("finance.collections.new")}
            </a>
          </div>
        }
      />

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="f-estado" className={labelCls}>
            {t("finance.filters.status")}
          </label>
          <select id="f-estado" name="estado" defaultValue={estado ?? ""} className={inputCls}>
            <option value="">{t("finance.filters.all")}</option>
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {t(`finance.status.${e}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-cliente" className={labelCls}>
            {t("finance.filters.client")}
          </label>
          <select id="f-cliente" name="cliente" defaultValue={cliente} className={inputCls}>
            <option value="">{t("finance.filters.allClients")}</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-anio" className={labelCls}>
            {t("finance.filters.year")}
          </label>
          <select id="f-anio" name="anio" defaultValue={anio} className={inputCls}>
            <option value="">{t("finance.filters.allYears")}</option>
            {anios.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-secondary">
          {t("finance.filters.apply")}
        </button>
        {hayFiltros ? (
          <Link
            href="/admin/finanzas/cobros"
            className="text-muted hover:text-ink py-2.5 text-sm underline underline-offset-4"
          >
            {t("finance.filters.clear")}
          </Link>
        ) : null}
      </form>

      <Panel className="mb-6">
        {filas.length === 0 ? (
          <EmptyState>
            {hayFiltros ? t("finance.collections.noneFiltered") : t("finance.collections.none")}
          </EmptyState>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.number")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.client")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.concept")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.project")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.issued")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.due")}
                    </th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">
                      {t("finance.cols.amount")}
                    </th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">
                      {t("finance.cols.collected")}
                    </th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">
                      {t("finance.cols.pending")}
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      {t("finance.cols.status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {filas.map(({ cobro, pagado, pendiente, estado: est }) => (
                    <tr key={cobro.id}>
                      <th
                        scope="row"
                        className="py-2.5 pr-4 font-normal whitespace-nowrap tabular-nums"
                      >
                        {cobro.numero}
                      </th>
                      <td className="text-muted py-2.5 pr-4">{nombre[cobro.empresa_id]}</td>
                      <td className="py-2.5 pr-4">
                        <Link
                          href={`/admin/finanzas/cobros/${cobro.id}`}
                          className="hover:text-accent font-medium underline-offset-4 hover:underline"
                        >
                          {cobro.concepto}
                        </Link>
                      </td>
                      <td className="text-muted py-2.5 pr-4">
                        {cobro.proyecto_id ? titulo[cobro.proyecto_id] : ""}
                      </td>
                      <td className="text-muted py-2.5 pr-4 whitespace-nowrap">
                        {fecha(cobro.fecha_emision)}
                      </td>
                      <td className="text-muted py-2.5 pr-4 whitespace-nowrap">
                        {cobro.fecha_vencimiento ? fecha(cobro.fecha_vencimiento) : ""}
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        {euros(cobro.importe)}
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{euros(pagado)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{euros(pendiente)}</td>
                      <td className="py-2.5">
                        <EstadoCobroBadge estado={est} />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[var(--fg)] font-semibold">
                    <th scope="row" colSpan={6} className="py-2.5 pr-4 text-left">
                      {t("finance.cols.total")}
                    </th>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {euros(suma("importe"))}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{euros(suma("pagado"))}</td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">
                      {euros(suma("pendiente"))}
                    </td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>

            <ul className="divide-y divide-[var(--rule)] md:hidden">
              {filas.map(({ cobro, pagado, pendiente, estado: est }) => (
                <li key={cobro.id} className="py-3 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/finanzas/cobros/${cobro.id}`}
                      className="hover:text-accent min-w-0 font-medium underline-offset-4 hover:underline"
                    >
                      {cobro.concepto}
                    </Link>
                    <EstadoCobroBadge estado={est} />
                  </div>
                  <p className="text-muted mt-0.5 text-xs">
                    {cobro.numero} · {nombre[cobro.empresa_id]}
                    {cobro.fecha_vencimiento
                      ? ` · ${t("finance.cols.due")} ${fecha(cobro.fecha_vencimiento)}`
                      : ""}
                  </p>
                  <dl className="mt-2 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <dt className="text-muted text-xs">{t("finance.cols.amount")}</dt>
                      <dd className="tabular-nums">{euros(cobro.importe)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-xs">{t("finance.cols.collected")}</dt>
                      <dd className="tabular-nums">{euros(pagado)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-xs">{t("finance.cols.pending")}</dt>
                      <dd className="tabular-nums">{euros(pendiente)}</dd>
                    </div>
                  </dl>
                </li>
              ))}
              <li className="pt-3">
                <p className="text-sm font-semibold">{t("finance.cols.total")}</p>
                <div className="mt-1 grid grid-cols-3 gap-2 text-sm font-semibold">
                  <span className="tabular-nums">{euros(suma("importe"))}</span>
                  <span className="tabular-nums">{euros(suma("pagado"))}</span>
                  <span className="tabular-nums">{euros(suma("pendiente"))}</span>
                </div>
              </li>
            </ul>
          </>
        )}
      </Panel>

      <div id="nuevo" className="scroll-mt-4">
        <Panel title={t("finance.collections.new")}>
          <FormCobro
            empresas={empresas.map((e) => ({ id: e.id, nombre: e.nombre }))}
            proyectos={proyectos.map((p) => ({
              id: p.id,
              nombre: p.titulo,
              empresa_id: p.empresa_id,
            }))}
            hoy={hoy}
            empresaInicial={empresaNuevo}
          />
        </Panel>
      </div>
    </>
  );
}
