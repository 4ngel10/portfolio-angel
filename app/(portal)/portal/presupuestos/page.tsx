import Link from "next/link";
import type { Metadata } from "next";
import { requireCliente } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { listarLineasPresupuesto, listarPresupuestos } from "@/lib/portal/queries";
import { totales } from "@/lib/portal/presupuestos";
import { EmptyState, EstadoPresupuestoBadge, PageHeader, Panel } from "@/components/portal/ui";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("quotes.clientTitle") };
}

export default async function PresupuestosPage() {
  await requireCliente();
  const { t, fecha, euros } = await getI18n();
  // RLS solo entrega los presupuestos enviados a su empresa.
  const [presupuestos, lineas] = await Promise.all([
    listarPresupuestos(),
    listarLineasPresupuesto(),
  ]);
  const totalDe = (p: (typeof presupuestos)[number]) =>
    totales(
      lineas.filter((l) => l.presupuesto_id === p.id),
      p.descuento,
      p.iva,
    ).total;
  const suma = (estado: string) =>
    presupuestos.filter((p) => p.estado === estado).reduce((s, p) => s + totalDe(p), 0);
  const cuenta = (estado: string) => presupuestos.filter((p) => p.estado === estado).length;

  return (
    <>
      <PageHeader title={t("quotes.clientTitle")} intro={t("quotes.clientIntro")} />
      <div className="grid gap-6">
        {presupuestos.length > 0 ? (
          <Aparece>
            <dl className="grid gap-4 sm:grid-cols-3">
              {(["enviado", "aceptado", "rechazado"] as const).map((estado) => (
                <div key={estado} className="border-rule bg-paper-alt rounded-2xl border p-5">
                  <dt className="text-muted text-sm">{t(`quotes.clientSummary.${estado}`)}</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                    {euros(suma(estado))}
                  </dd>
                  <dd className="text-muted mt-0.5 text-sm">
                    {t("quotes.count", { n: cuenta(estado) })}
                  </dd>
                </div>
              ))}
            </dl>
          </Aparece>
        ) : null}

        <Aparece retraso={0.05}>
          <Panel title={t("quotes.all")}>
            {presupuestos.length === 0 ? (
              <EmptyState>{t("quotes.clientNone")}</EmptyState>
            ) : (
              <ul className="divide-y divide-[var(--rule)]">
                {presupuestos.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/portal/presupuestos/${p.id}`}
                      className="hover:bg-chip -mx-2 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-lg px-2 py-3 transition-colors"
                    >
                      <span className="min-w-0">
                        <span className="block font-medium">{p.titulo}</span>
                        <span className="text-muted block text-sm tabular-nums">
                          {p.numero} · {fecha(p.fecha_emision)}
                        </span>
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="font-semibold tabular-nums">{euros(totalDe(p))}</span>
                        <EstadoPresupuestoBadge estado={p.estado} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </Aparece>
      </div>
    </>
  );
}
