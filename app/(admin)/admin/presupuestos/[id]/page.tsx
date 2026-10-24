import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { listarEmpresas, listarLineasPresupuesto } from "@/lib/portal/queries";
import { cambiarEstadoPresupuesto, eliminarPresupuesto } from "@/lib/portal/actions";
import { isUuid } from "@/lib/portal/validate";
import { ESTADOS_PRESUPUESTO } from "@/lib/portal/presupuestos";
import type { Presupuesto } from "@/lib/portal/types";
import { ConfirmSubmit } from "@/components/portal/confirm-submit";
import { PresupuestoDocumento } from "@/components/portal/presupuesto-documento";
import { PresupuestoForm } from "@/components/portal/presupuesto-form";
import { PageHeader, Panel } from "@/components/portal/ui";

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
  const { t } = await getI18n();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("presupuestos").select("*").eq("id", id).maybeSingle();
  const presupuesto = data as Presupuesto | null;
  if (!presupuesto) notFound();

  const [lineas, empresas] = await Promise.all([listarLineasPresupuesto([id]), listarEmpresas()]);
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
