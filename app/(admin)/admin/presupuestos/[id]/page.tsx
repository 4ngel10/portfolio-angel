import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { listarEmpresas, listarLineasPresupuesto } from "@/lib/portal/queries";
import { cambiarEstadoPresupuesto, eliminarPresupuesto } from "@/lib/portal/actions";
import { isUuid } from "@/lib/portal/validate";
import { ESTADOS_PRESUPUESTO, totales } from "@/lib/portal/presupuestos";
import { cobrosConEstado } from "@/lib/portal/finanzas-queries";
import type { Presupuesto } from "@/lib/portal/types";
import { ConfirmSubmit } from "@/components/portal/confirm-submit";
import { PlanCobros } from "@/components/portal/finanzas-forms";
import { PresupuestoDocumento } from "@/components/portal/presupuesto-documento";
import { PresupuestoForm } from "@/components/portal/presupuesto-form";
import { EstadoCobroBadge, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("quotes.adminTitle") };
}

export default async function PresupuestoAdminPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { t, euros } = await getI18n();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("presupuestos").select("*").eq("id", id).maybeSingle();
  const presupuesto = data as Presupuesto | null;
  if (!presupuesto) notFound();

  const [lineas, empresas, cobros] = await Promise.all([
    listarLineasPresupuesto([id]),
    listarEmpresas(),
    cobrosConEstado({ presupuestoId: id }),
  ]);
  const empresa = empresas.find((e) => e.id === presupuesto.empresa_id);
  const hoy = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
  // Un presupuesto ya respondido no se edita: se reabre cambiando su estado.
  const editable = presupuesto.estado === "borrador" || presupuesto.estado === "enviado";

  return (
    <>
      <p className="mb-3 text-sm">
        <Link
          href="/admin/presupuestos"
          className="text-muted hover:text-ink underline-offset-4 hover:underline"
        >
          {t("quotes.backToList")}
        </Link>
      </p>
      <PageHeader title={presupuesto.numero} />

      <div className="grid gap-6">
        <Panel title={t("quotes.statusTitle")}>
          <p className="text-muted mb-3 max-w-[60ch] text-sm">{t("quotes.statusHelp")}</p>
          <div className="flex flex-wrap gap-2">
            {ESTADOS_PRESUPUESTO.map((estado) => (
              <form key={estado} action={cambiarEstadoPresupuesto}>
                <input type="hidden" name="id" value={id} />
                <input type="hidden" name="estado" value={estado} />
                <button
                  type="submit"
                  disabled={presupuesto.estado === estado}
                  aria-pressed={presupuesto.estado === estado}
                  className="btn-secondary !px-4 !py-2 !text-sm disabled:opacity-100 aria-pressed:border-[var(--accent)]"
                >
                  {t(`quotes.status.${estado}`)}
                </button>
              </form>
            ))}
          </div>
        </Panel>

        {presupuesto.estado === "aceptado" ? (
          <Panel title={t("finance.collections.title")}>
            {cobros.length === 0 ? (
              <PlanCobros
                presupuestoId={id}
                total={totales(lineas, presupuesto.descuento, presupuesto.iva).total}
              />
            ) : (
              <ul className="divide-y divide-[var(--rule)]">
                {[...cobros]
                  .sort((a, b) => a.cobro.numero.localeCompare(b.cobro.numero))
                  .map(({ cobro, pendiente, estado }) => (
                    <li
                      key={cobro.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <Link
                        href={`/admin/finanzas/cobros/${cobro.id}`}
                        className="hover:text-accent min-w-0 font-medium underline-offset-4 hover:underline"
                      >
                        {cobro.concepto}
                      </Link>
                      <span className="flex items-center gap-3 text-sm">
                        <span className="tabular-nums">{euros(cobro.importe)}</span>
                        <span className="text-muted tabular-nums">
                          {t("finance.collections.pendingAmount", { amount: euros(pendiente) })}
                        </span>
                        <EstadoCobroBadge estado={estado} />
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </Panel>
        ) : null}

        <PresupuestoDocumento presupuesto={presupuesto} lineas={lineas} empresa={empresa} />

        {editable ? (
          <Panel title={t("quotes.edit")}>
            <PresupuestoForm
              empresas={empresas.map((e) => ({ id: e.id, nombre: e.nombre }))}
              hoy={hoy}
              inicial={{
                id,
                empresa_id: presupuesto.empresa_id,
                titulo: presupuesto.titulo,
                fecha_emision: presupuesto.fecha_emision,
                valido_hasta: presupuesto.valido_hasta,
                iva: presupuesto.iva,
                descuento: presupuesto.descuento,
                notas: presupuesto.notas,
                lineas,
              }}
            />
          </Panel>
        ) : null}

        <form action={eliminarPresupuesto}>
          <input type="hidden" name="id" value={id} />
          <ConfirmSubmit
            mensaje={t("quotes.deleteConfirm", { number: presupuesto.numero })}
            className="btn-secondary !px-4 !py-2 !text-sm"
          >
            {t("quotes.delete")}
          </ConfirmSubmit>
        </form>
      </div>
    </>
  );
}
