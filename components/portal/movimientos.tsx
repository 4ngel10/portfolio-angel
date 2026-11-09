import type { PortalT } from "@/lib/portal/translate";
import type { BolsaMovimiento } from "@/lib/portal/types";

/** El saldo inicial de la migración se guarda en español: se muestra en el idioma activo. */
export const SALDO_INICIAL = "Saldo inicial";

type Fmt = {
  t: PortalT;
  fecha: (iso: string) => string;
  horas: (n: number) => string;
};

const concepto = (m: BolsaMovimiento, t: PortalT, clave: string) =>
  m.concepto === SALDO_INICIAL ? t(clave) : m.concepto;

/** Horas con signo: las correcciones salen con "−" para distinguirlas de un apunte normal. */
const conSigno = (n: number, horas: (n: number) => string) =>
  n < 0 ? `−${horas(Math.abs(n))}` : horas(n);

/** Lista compacta (admin): fecha, concepto, proyecto y horas. */
export function MovimientosLista({
  movimientos,
  proyectos,
  t,
  fecha,
  horas,
}: Fmt & { movimientos: BolsaMovimiento[]; proyectos: Record<string, string> }) {
  return (
    <ul className="divide-y divide-[var(--rule)]">
      {movimientos.map((m) => (
        <li key={m.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
          <div className="min-w-0">
            <p className="break-words">{concepto(m, t, "admin.openingBalance")}</p>
            <p className="text-muted mt-0.5 text-xs">
              {fecha(m.fecha)}
              {m.proyecto_id && proyectos[m.proyecto_id] ? ` · ${proyectos[m.proyecto_id]}` : ""}
            </p>
          </div>
          <span
            className={`shrink-0 font-semibold tabular-nums ${m.horas < 0 ? "text-[var(--accent)]" : ""}`}
          >
            {conSigno(m.horas, horas)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Tabla por meses (cliente y ficha del admin). En móvil cada fila pasa a tarjeta. */
export function MovimientosPorMes({
  movimientos,
  proyectos,
  mesLabel,
  t,
  fecha,
  horas,
}: Fmt & {
  movimientos: BolsaMovimiento[];
  proyectos: Record<string, string>;
  /** "2026-11" a "noviembre de 2026". */
  mesLabel: (mes: string) => string;
}) {
  const meses: { mes: string; items: BolsaMovimiento[] }[] = [];
  for (const m of movimientos) {
    const mes = m.fecha.slice(0, 7);
    const ultimo = meses[meses.length - 1];
    if (ultimo && ultimo.mes === mes) ultimo.items.push(m);
    else meses.push({ mes, items: [m] });
  }

  return (
    <div className="grid gap-6">
      {meses.map(({ mes, items }) => {
        const total = Math.round(items.reduce((s, m) => s + m.horas, 0) * 100) / 100;
        return (
          <section key={mes} aria-label={mesLabel(mes)}>
            <h3 className="mb-2 flex items-baseline justify-between gap-3 text-sm font-semibold">
              <span className="first-letter:uppercase">{mesLabel(mes)}</span>
              <span className="text-muted font-normal tabular-nums">{conSigno(total, horas)}</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-muted text-xs">
                  <tr>
                    <th scope="col" className="py-2 pr-4 font-medium whitespace-nowrap">
                      {t("hoursPage.colDate")}
                    </th>
                    <th scope="col" className="py-2 pr-4 text-right font-medium whitespace-nowrap">
                      {t("hoursPage.colHours")}
                    </th>
                    <th scope="col" className="hidden py-2 pr-4 font-medium sm:table-cell">
                      {t("hoursPage.colProject")}
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      {t("hoursPage.colConcept")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--rule)] border-t border-[var(--rule)]">
                  {items.map((m) => (
                    <tr key={m.id} className="align-top">
                      <td className="py-2.5 pr-4 whitespace-nowrap">{fecha(m.fecha)}</td>
                      <td
                        className={`py-2.5 pr-4 text-right font-semibold whitespace-nowrap tabular-nums ${m.horas < 0 ? "text-[var(--accent)]" : ""}`}
                      >
                        {conSigno(m.horas, horas)}
                      </td>
                      <td className="text-muted hidden py-2.5 pr-4 sm:table-cell">
                        {m.proyecto_id && proyectos[m.proyecto_id]
                          ? proyectos[m.proyecto_id]
                          : t("hoursPage.noProject")}
                      </td>
                      <td className="py-2.5 break-words">
                        {concepto(m, t, "hoursPage.openingBalance")}
                        {m.proyecto_id && proyectos[m.proyecto_id] ? (
                          <span className="text-muted mt-0.5 block text-xs sm:hidden">
                            {proyectos[m.proyecto_id]}
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        );
      })}
    </div>
  );
}
