import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { listarEmpresas, listarLineasPresupuesto, listarPresupuestos } from "@/lib/portal/queries";
import { totales } from "@/lib/portal/presupuestos";
import { EmptyState, EstadoPresupuestoBadge, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("quotes.adminTitle") };
}

export default async function PresupuestosAdminPage() {
  await requireAdmin();
  const { t, fecha, euros } = await getI18n();
  const [presupuestos, lineas, empresas] = await Promise.all([
    listarPresupuestos(),
    listarLineasPresupuesto(),
    listarEmpresas(),
  ]);
  const nombre = Object.fromEntries(empresas.map((e) => [e.id, e.nombre]));
  const totalDe = (p: (typeof presupuestos)[number]) =>
    totales(
      lineas.filter((l) => l.presupuesto_id === p.id),
      p.descuento,
      p.iva,
    ).total;

  // Importe pendiente de respuesta y ya aceptado, para ver de un vistazo cómo va el negocio.
  const suma = (estado: string) =>
    presupuestos.filter((p) => p.estado === estado).reduce((s, p) => s + totalDe(p), 0);

  return (
    <>
      <PageHeader
        title={t("quotes.adminTitle")}
        intro={t("quotes.adminIntro")}
        action={
          <Link href="/admin/presupuestos/nuevo" className="btn-primary">
            {t("quotes.new")}
          </Link>
        }
      />

      <dl className="mb-6 grid gap-4 sm:grid-cols-3">
        {(
          [
            ["pending", suma("enviado")],
            ["accepted", suma("aceptado")],
            ["drafts", suma("borrador")],
          ] as const
        ).map(([clave, valor]) => (
          <div key={clave} className="border-rule bg-paper-alt rounded-2xl border p-5">
            <dt className="text-muted text-sm">{t(`quotes.summary.${clave}`)}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {euros(valor)}
            </dd>
          </div>
        ))}
      </dl>

      <Panel title={t("quotes.all")}>
        {presupuestos.length === 0 ? (
          <EmptyState>{t("quotes.none")}</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    {t("quotes.number")}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    {t("quotes.titleLabel")}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    {t("admin.colCompany")}
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium">
                    {t("admin.colStatus")}
                  </th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">
                    {t("quotes.total")}
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    {t("quotes.issueDate")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {presupuestos.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 pr-4 tabular-nums">{p.numero}</td>
                    <td className="py-2.5 pr-4">
                      <Link
                        href={`/admin/presupuestos/${p.id}`}
                        className="hover:text-accent font-medium underline-offset-4 hover:underline"
                      >
                        {p.titulo}
                      </Link>
                    </td>
                    <td className="text-muted py-2.5 pr-4">{nombre[p.empresa_id]}</td>
                    <td className="py-2.5 pr-4">
                      <EstadoPresupuestoBadge estado={p.estado} />
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums">{euros(totalDe(p))}</td>
                    <td className="text-muted py-2.5">{fecha(p.fecha_emision)}</td>
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
