import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { cargarAjustes, listarSuscripciones } from "@/lib/portal/finanzas-queries";
import { costeAnual, costeMensual, diasEntre, hoyMadrid } from "@/lib/portal/finanzas";
import { darDeBajaSuscripcion, reactivarSuscripcion } from "@/lib/portal/finanzas-actions";
import { redondear } from "@/lib/portal/presupuestos";
import type { Suscripcion } from "@/lib/portal/types";
import { ConfirmSubmit } from "@/components/portal/confirm-submit";
import { FormSuscripcion } from "@/components/portal/finanzas-forms";
import { KpiTile } from "@/components/portal/finanzas-ui";
import { EmptyState, PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("finance.subscriptions.title") };
}

export default async function SuscripcionesPage({
  searchParams,
}: {
  searchParams: Promise<{ editar?: string }>;
}) {
  await requireAdmin();
  const { t, fecha, euros } = await getI18n();
  const hoy = hoyMadrid();
  const [todas, ajustes] = await Promise.all([listarSuscripciones(), cargarAjustes()]);
  const activas = todas.filter((s) => s.activa);
  const bajas = todas.filter((s) => !s.activa);
  const { editar } = await searchParams;
  const editando = todas.find((s) => s.id === editar);

  const mensual = redondear(activas.reduce((s, x) => s + costeMensual(x), 0));
  const anual = redondear(activas.reduce((s, x) => s + costeAnual(x), 0));

  // La renovación se marca con el acento cuando entra en su ventana de aviso.
  const cercana = (s: Suscripcion) => diasEntre(hoy, s.proxima_renovacion) <= s.aviso_dias;

  const acciones = (s: Suscripcion) => (
    <div className="flex items-center gap-4">
      <Link
        href={`/admin/finanzas/suscripciones?editar=${s.id}#nueva`}
        className="text-muted hover:text-ink text-sm underline underline-offset-4"
      >
        {t("finance.subscriptions.edit")}
      </Link>
      {s.activa ? (
        <form action={darDeBajaSuscripcion}>
          <input type="hidden" name="id" value={s.id} />
          <ConfirmSubmit
            mensaje={t("finance.subscriptions.confirmCancel")}
            className="text-muted hover:text-accent text-sm underline underline-offset-4"
          >
            {t("finance.subscriptions.cancel")}
          </ConfirmSubmit>
        </form>
      ) : (
        <form action={reactivarSuscripcion}>
          <input type="hidden" name="id" value={s.id} />
          <button
            type="submit"
            className="text-muted hover:text-ink text-sm underline underline-offset-4"
          >
            {t("finance.subscriptions.reactivate")}
          </button>
        </form>
      )}
    </div>
  );

  return (
    <>
      <PageHeader
        title={t("finance.subscriptions.title")}
        intro={t("finance.subscriptions.intro")}
        action={
          <a href="#nueva" className="btn-primary">
            {t("finance.subscriptions.new")}
          </a>
        }
      />

      <dl className="mb-6 grid grid-cols-2 gap-3">
        <KpiTile label={t("finance.subscriptions.monthlyCost")} value={euros(mensual)} />
        <KpiTile label={t("finance.subscriptions.annualCost")} value={euros(anual)} />
      </dl>

      <Panel title={t("finance.subscriptions.active")} className="mb-6">
        {activas.length === 0 ? (
          <EmptyState>{t("finance.subscriptions.none")}</EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {activas.map((s) => (
              <li key={s.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                  <div className="min-w-0">
                    <p className="font-medium">{s.nombre}</p>
                    <p className="text-muted mt-0.5 text-sm">
                      {[s.proveedor, t(`finance.category.${s.categoria}`)]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {s.url_gestion ? (
                      <a
                        href={s.url_gestion}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-accent text-sm underline underline-offset-4"
                      >
                        {t("finance.subscriptions.manage")}
                      </a>
                    ) : null}
                  </div>
                  <dl className="grid grid-cols-3 gap-x-6 text-sm">
                    <div>
                      <dt className="text-muted text-xs">{t("finance.subscriptions.amount")}</dt>
                      <dd className="tabular-nums">
                        {euros(s.importe)} / {t(`finance.periodShort.${s.periodicidad}`)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted text-xs">{t("finance.subscriptions.perMonth")}</dt>
                      <dd className="tabular-nums">{euros(costeMensual(s))}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-xs">{t("finance.subscriptions.renewal")}</dt>
                      <dd
                        className={`tabular-nums ${cercana(s) ? "font-medium text-[var(--accent)]" : ""}`}
                      >
                        {fecha(s.proxima_renovacion)}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="mt-2">{acciones(s)}</div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {bajas.length > 0 ? (
        <details className="border-rule bg-paper-alt mb-6 rounded-2xl border p-5 md:p-6">
          <summary className="cursor-pointer text-lg font-semibold tracking-tight">
            {t("finance.subscriptions.cancelled", { count: bajas.length })}
          </summary>
          <ul className="divide-y divide-[var(--rule)] pt-4">
            {bajas.map((s) => (
              <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="font-medium">{s.nombre}</p>
                  <p className="text-muted text-sm tabular-nums">
                    {euros(s.importe)} / {t(`finance.periodShort.${s.periodicidad}`)}
                    {s.fecha_baja
                      ? ` · ${t("finance.subscriptions.endedOn", { date: fecha(s.fecha_baja) })}`
                      : ""}
                  </p>
                </div>
                <div className="mt-1.5">{acciones(s)}</div>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div id="nueva" className="scroll-mt-4">
        <Panel title={editando ? t("finance.subscriptions.edit") : t("finance.subscriptions.new")}>
          <FormSuscripcion
            key={editando?.id ?? "nueva"}
            hoy={hoy}
            fiscal={ajustes.config_fiscal}
            inicial={editando}
          />
          {editando ? (
            <Link
              href="/admin/finanzas/suscripciones"
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
