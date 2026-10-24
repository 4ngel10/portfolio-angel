import { getI18n } from "@/lib/portal/i18n";
import { totales } from "@/lib/portal/presupuestos";
import type { Empresa, Presupuesto, PresupuestoLinea } from "@/lib/portal/types";
import { EstadoPresupuestoBadge, Panel } from "./ui";

/** Presupuesto completo (cabecera, líneas, totales, notas y firma). Lo ven el admin y el cliente. */
export async function PresupuestoDocumento({
  presupuesto,
  lineas,
  empresa,
}: {
  presupuesto: Presupuesto;
  lineas: PresupuestoLinea[];
  empresa?: Empresa;
}) {
  const { t, fecha, fechaHora, euros } = await getI18n();
  const calculo = totales(lineas, presupuesto.descuento, presupuesto.iva);

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-muted text-sm tabular-nums">{presupuesto.numero}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{presupuesto.titulo}</h2>
          {empresa ? <p className="text-muted mt-1 text-sm">{empresa.nombre}</p> : null}
        </div>
        <EstadoPresupuestoBadge estado={presupuesto.estado} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted">{t("quotes.issueDate")}</dt>
          <dd className="mt-0.5 font-semibold">{fecha(presupuesto.fecha_emision)}</dd>
        </div>
        {presupuesto.valido_hasta ? (
          <div>
            <dt className="text-muted">{t("quotes.validUntil")}</dt>
            <dd className="mt-0.5 font-semibold">{fecha(presupuesto.valido_hasta)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th scope="col" className="py-2 pr-4 font-medium">
                {t("quotes.concept")}
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                {t("quotes.quantity")}
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-medium">
                {t("quotes.unitPrice")}
              </th>
              <th scope="col" className="py-2 text-right font-medium">
                {t("quotes.lineTotal")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--rule)]">
            {lineas.map((l) => (
              <tr key={l.id}>
                <td className="py-2.5 pr-4">
                  <span className="font-medium">{l.concepto}</span>
                  {l.detalle ? <span className="text-muted block text-xs">{l.detalle}</span> : null}
                </td>
                <td className="py-2.5 pr-4 text-right tabular-nums">{l.cantidad}</td>
                <td className="py-2.5 pr-4 text-right tabular-nums">{euros(l.precio_unitario)}</td>
                <td className="py-2.5 text-right tabular-nums">
                  {euros(l.cantidad * l.precio_unitario)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dl className="mt-5 ml-auto grid max-w-xs gap-2 text-sm tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("quotes.subtotal")}</dt>
          <dd>{euros(calculo.subtotal)}</dd>
        </div>
        {calculo.descuento > 0 ? (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">
              {t("quotes.discountLine", { pct: presupuesto.descuento })}
            </dt>
            <dd>-{euros(calculo.descuento)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("quotes.taxBase")}</dt>
          <dd>{euros(calculo.base)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">{t("quotes.vatLine", { pct: presupuesto.iva })}</dt>
          <dd>{euros(calculo.iva)}</dd>
        </div>
        <div className="border-rule flex justify-between gap-4 border-t pt-3 text-lg font-semibold">
          <dt>{t("quotes.total")}</dt>
          <dd>{euros(calculo.total)}</dd>
        </div>
      </dl>

      {presupuesto.notas ? (
        <div className="mt-6">
          <h3 className="text-sm font-semibold">{t("quotes.notes")}</h3>
          <p className="text-muted mt-1 max-w-[70ch] text-sm whitespace-pre-line">
            {presupuesto.notas}
          </p>
        </div>
      ) : null}

      {presupuesto.firma_nombre && presupuesto.firma_fecha ? (
        <div className="border-rule mt-6 border-t pt-5">
          <h3 className="text-sm font-semibold">{t("quotes.signedTitle")}</h3>
          <p className="mt-2 text-xl font-semibold tracking-tight italic">
            {presupuesto.firma_nombre}
          </p>
          <p className="text-muted mt-1 text-sm">
            {t("quotes.signedOn", { date: fechaHora(presupuesto.firma_fecha) })}
          </p>
        </div>
      ) : null}
    </Panel>
  );
}
