import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { cargarAjustes, listarGastos } from "@/lib/portal/finanzas-queries";
import { CATEGORIAS_GASTO, hoyMadrid } from "@/lib/portal/finanzas";
import { eliminarGasto } from "@/lib/portal/finanzas-actions";
import { listarEmpresas, listarProyectos } from "@/lib/portal/queries";
import { redondear } from "@/lib/portal/presupuestos";
import { isUuid, oneOf } from "@/lib/portal/validate";
import { ConfirmSubmit } from "@/components/portal/confirm-submit";
import { EnlaceCsv } from "@/components/portal/finanzas-ui";
import { FormGasto } from "@/components/portal/finanzas-forms";
import { SubirJustificante, VerJustificante } from "@/components/portal/justificante";
import { inputCls, labelCls } from "@/components/portal/styles";
import { EmptyState, OrigenBadge, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("finance.expenses.title") };
}

type Params = {
  categoria?: string;
  anio?: string;
  mes?: string;
  proyecto?: string;
  justificante?: string;
  editar?: string;
};

export default async function GastosPage({ searchParams }: { searchParams: Promise<Params> }) {
  await requireAdmin();
  const { t, fecha, euros, locale } = await getI18n();
  const q = await searchParams;
  const hoy = hoyMadrid();
  const categoria = oneOf(q.categoria, CATEGORIAS_GASTO);
  const anio = /^\d{4}$/.test(q.anio ?? "") ? (q.anio as string) : "";
  const mes = /^(0[1-9]|1[0-2])$/.test(q.mes ?? "") ? (q.mes as string) : "";
  const proyecto = isUuid(q.proyecto) ? q.proyecto : "";
  const justificante = oneOf(q.justificante, ["con", "sin"] as const);

  const [todos, ajustes, empresas, proyectos] = await Promise.all([
    listarGastos(),
    cargarAjustes(),
    listarEmpresas(),
    listarProyectos(),
  ]);
  const titulo = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));
  const nombre = Object.fromEntries(empresas.map((e) => [e.id, e.nombre]));
  const anios = [...new Set([hoy.slice(0, 4), ...todos.map((g) => g.fecha.slice(0, 4))])].sort(
    (a, b) => b.localeCompare(a),
  );

  const filas = todos.filter((g) => {
    if (categoria && g.categoria !== categoria) return false;
    if (anio && !g.fecha.startsWith(anio)) return false;
    if (mes && g.fecha.slice(5, 7) !== mes) return false;
    if (proyecto && g.proyecto_id !== proyecto) return false;
    if (justificante === "con" && !g.justificante_path) return false;
    if (justificante === "sin" && g.justificante_path) return false;
    return true;
  });
  const total = redondear(filas.reduce((s, g) => s + g.importe, 0));
  const hayFiltros = Boolean(categoria || anio || mes || proyecto || justificante);
  const editando = todos.find((g) => g.id === q.editar);
  const mesesNombre = Array.from({ length: 12 }, (_, i) => ({
    valor: String(i + 1).padStart(2, "0"),
    nombre: new Intl.DateTimeFormat(locale, { month: "long", timeZone: "UTC" }).format(
      new Date(Date.UTC(2026, i, 1)),
    ),
  }));

  const celdaImputacion = (g: (typeof filas)[number]) =>
    [g.proyecto_id ? titulo[g.proyecto_id] : null, g.empresa_id ? nombre[g.empresa_id] : null]
      .filter(Boolean)
      .join(" · ");

  const celdaJustificante = (g: (typeof filas)[number]) => (
    <div className="flex flex-wrap items-center gap-2">
      {g.justificante_path ? <VerJustificante gastoId={g.id} /> : null}
      <SubirJustificante gastoId={g.id} tiene={Boolean(g.justificante_path)} />
    </div>
  );

  const acciones = (g: (typeof filas)[number]) => (
    <div className="flex items-center justify-end gap-4">
      <Link
        href={`/admin/finanzas/gastos?editar=${g.id}#nuevo`}
        className="text-muted hover:text-ink text-sm underline underline-offset-4"
      >
        {t("finance.expenses.edit")}
      </Link>
      <form action={eliminarGasto}>
        <input type="hidden" name="id" value={g.id} />
        <ConfirmSubmit
          mensaje={t("finance.expenses.confirmDelete")}
          className="text-muted hover:text-accent text-sm underline underline-offset-4"
        >
          {t("finance.expenses.delete")}
        </ConfirmSubmit>
      </form>
    </div>
  );

  return (
    <>
      <PageHeader
        title={t("finance.expenses.title")}
        intro={t("finance.expenses.intro")}
        action={
          <div className="flex flex-wrap gap-3">
            <EnlaceCsv
              tipo="gastos"
              desde={anio ? `${anio}-${mes || "01"}-01` : undefined}
              hasta={anio ? `${anio}-${mes || "12"}-31` : undefined}
            >
              {t("finance.export.csv")}
            </EnlaceCsv>
            <a href="#nuevo" className="btn-primary">
              {t("finance.expenses.new")}
            </a>
          </div>
        }
      />

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="g-categoria" className={labelCls}>
            {t("finance.filters.category")}
          </label>
          <select
            id="g-categoria"
            name="categoria"
            defaultValue={categoria ?? ""}
            className={inputCls}
          >
            <option value="">{t("finance.filters.allCategories")}</option>
            {CATEGORIAS_GASTO.map((c) => (
              <option key={c} value={c}>
                {t(`finance.category.${c}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="g-anio" className={labelCls}>
            {t("finance.filters.year")}
          </label>
          <select id="g-anio" name="anio" defaultValue={anio} className={inputCls}>
            <option value="">{t("finance.filters.allYears")}</option>
            {anios.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="g-mes" className={labelCls}>
            {t("finance.filters.month")}
          </label>
          <select id="g-mes" name="mes" defaultValue={mes} className={inputCls}>
            <option value="">{t("finance.filters.allMonths")}</option>
            {mesesNombre.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="g-proyecto" className={labelCls}>
            {t("finance.filters.project")}
          </label>
          <select id="g-proyecto" name="proyecto" defaultValue={proyecto} className={inputCls}>
            <option value="">{t("finance.filters.allProjects")}</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.titulo}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="g-just" className={labelCls}>
            {t("finance.filters.receipt")}
          </label>
          <select
            id="g-just"
            name="justificante"
            defaultValue={justificante ?? ""}
            className={inputCls}
          >
            <option value="">{t("finance.filters.all")}</option>
            <option value="con">{t("finance.filters.withReceipt")}</option>
            <option value="sin">{t("finance.filters.withoutReceipt")}</option>
          </select>
        </div>
        <button type="submit" className="btn-secondary">
          {t("finance.filters.apply")}
        </button>
        {hayFiltros ? (
          <Link
            href="/admin/finanzas/gastos"
            className="text-muted hover:text-ink py-2.5 text-sm underline underline-offset-4"
          >
            {t("finance.filters.clear")}
          </Link>
        ) : null}
      </form>

      <Panel className="mb-6">
        {filas.length === 0 ? (
          <EmptyState>
            {hayFiltros ? t("finance.expenses.noneFiltered") : t("finance.expenses.none")}
          </EmptyState>
        ) : (
          <>
            <p className="text-muted mb-3 text-xs">{t("finance.receipt.hint")}</p>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-sm">
                <thead className="text-muted">
                  <tr>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.date")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.concept")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.provider")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.category")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.attributed")}
                    </th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium">
                      {t("finance.cols.amount")}
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {t("finance.cols.receipt")}
                    </th>
                    <th scope="col" className="py-2 text-right font-medium">
                      <span className="sr-only">{t("finance.cols.actions")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)]">
                  {filas.map((g) => (
                    <tr key={g.id}>
                      <th scope="row" className="py-2.5 pr-4 font-normal whitespace-nowrap">
                        {fecha(g.fecha)}
                      </th>
                      <td className="py-2.5 pr-4">
                        <span className="font-medium">{g.concepto}</span>
                        {g.suscripcion_id ? (
                          <span className="ml-2">
                            <OrigenBadge origen="suscripcion" />
                          </span>
                        ) : null}
                      </td>
                      <td className="text-muted py-2.5 pr-4">{g.proveedor ?? ""}</td>
                      <td className="text-muted py-2.5 pr-4">
                        {t(`finance.category.${g.categoria}`)}
                      </td>
                      <td className="text-muted py-2.5 pr-4">{celdaImputacion(g)}</td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">{euros(g.importe)}</td>
                      <td className="py-2.5 pr-4">{celdaJustificante(g)}</td>
                      <td className="py-2.5">{acciones(g)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-[var(--fg)] font-semibold">
                    <th scope="row" colSpan={5} className="py-2.5 pr-4 text-left">
                      {t("finance.cols.total")}
                    </th>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{euros(total)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>

            <ul className="divide-y divide-[var(--rule)] md:hidden">
              {filas.map((g) => (
                <li key={g.id} className="py-3 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 font-medium">{g.concepto}</p>
                    <p className="font-medium tabular-nums">{euros(g.importe)}</p>
                  </div>
                  <p className="text-muted mt-0.5 text-xs">
                    {fecha(g.fecha)} · {t(`finance.category.${g.categoria}`)}
                    {g.proveedor ? ` · ${g.proveedor}` : ""}
                    {celdaImputacion(g) ? ` · ${celdaImputacion(g)}` : ""}
                  </p>
                  {g.suscripcion_id ? (
                    <div className="mt-1.5">
                      <OrigenBadge origen="suscripcion" />
                    </div>
                  ) : null}
                  <div className="mt-2">{celdaJustificante(g)}</div>
                  <div className="mt-2">{acciones(g)}</div>
                </li>
              ))}
              <li className="flex justify-between pt-3 text-sm font-semibold">
                <span>{t("finance.cols.total")}</span>
                <span className="tabular-nums">{euros(total)}</span>
              </li>
            </ul>
          </>
        )}
      </Panel>

      <div id="nuevo" className="scroll-mt-4">
        <Panel title={editando ? t("finance.expenses.edit") : t("finance.expenses.new")}>
          <FormGasto
            key={editando?.id ?? "nuevo"}
            proyectos={proyectos.map((p) => ({ id: p.id, nombre: p.titulo }))}
            empresas={empresas.map((e) => ({ id: e.id, nombre: e.nombre }))}
            hoy={hoy}
            fiscal={ajustes.config_fiscal}
            inicial={editando}
          />
          {editando ? (
            <Link
              href="/admin/finanzas/gastos"
              className="text-muted hover:text-ink mt-3 inline-block text-sm underline underline-offset-4"
            >
              {t("common.cancel")}
            </Link>
          ) : null}
        </Panel>
      </div>
    </>
  );
}
