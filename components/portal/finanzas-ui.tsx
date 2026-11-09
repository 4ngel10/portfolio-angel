import Link from "next/link";
import { getI18n } from "@/lib/portal/i18n";
import { PERIODOS, type ClavePeriodo } from "@/lib/portal/finanzas";
import { ProgressBar } from "./ui";

/** Cifra del resumen. Con `aviso` el importe va en el acento (por ejemplo, lo vencido). */
export function KpiTile({
  label,
  value,
  aviso = false,
  positivo = false,
  hint,
}: {
  label: string;
  value: string;
  aviso?: boolean;
  /** Cifra en verde suave (resultado positivo). */
  positivo?: boolean;
  hint?: string;
}) {
  return (
    <div className="border-rule bg-paper-alt rounded-xl border p-4">
      <dt className="text-muted text-sm">{label}</dt>
      <dd
        className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${aviso ? "text-[var(--accent)]" : positivo ? "text-[var(--positive)]" : ""}`}
      >
        {value}
      </dd>
      {hint ? <dd className="text-muted mt-1 text-xs">{hint}</dd> : null}
    </div>
  );
}

/** Selector de periodo con enlaces: se comparte y funciona sin JavaScript. */
export async function PeriodoSelector({ actual }: { actual: ClavePeriodo }) {
  const { t } = await getI18n();
  return (
    <nav aria-label={t("finance.summary.period")} className="flex flex-wrap gap-1">
      {PERIODOS.map((p) => (
        <Link
          key={p}
          href={`/admin/finanzas?periodo=${p}`}
          aria-current={p === actual ? "true" : undefined}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            p === actual ? "bg-chip text-ink" : "text-muted hover:text-ink"
          }`}
        >
          {t(`finance.summary.periods.${p}`)}
        </Link>
      ))}
    </nav>
  );
}

/** Escala mínima de la gráfica: con importes pequeños las barras no ocupan toda la altura. */
const ESCALA_MINIMA = 500;

/**
 * Ingresos frente a gastos de los últimos 12 meses. Dibujado a mano con CSS: dos barras por
 * mes sobre un máximo común (500 € como mínimo) y base en cero, con líneas de referencia en 0,
 * la mitad y el máximo. Cada mes es enfocable: al pasar el ratón o al enfocarlo muestra sus
 * importes, y lleva su texto equivalente para lectores de pantalla.
 */
export async function BarrasMensuales({
  serie,
}: {
  serie: { mes: string; ingresos: number; gastos: number }[];
}) {
  const { t, euros, locale } = await getI18n();
  const maximo = Math.max(ESCALA_MINIMA, ...serie.flatMap((s) => [s.ingresos, s.gastos]));
  const etiqueta = (mes: string, formato: "short" | "long") => {
    const [y, m] = mes.split("-").map(Number);
    const texto = new Intl.DateTimeFormat(locale, {
      month: formato,
      ...(formato === "long" ? { year: "numeric" } : {}),
      timeZone: "UTC",
    }).format(new Date(Date.UTC(y, m - 1, 1)));
    // Abreviado: siempre 3 letras y sin punto ("sep", no "sept." ni "sept").
    return formato === "short" ? texto.replace(".", "").slice(0, 3).toLowerCase() : texto;
  };
  const referencias = [maximo, maximo / 2, 0];

  return (
    <figure>
      <figcaption className="text-muted mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-[var(--accent)]" aria-hidden />
          {t("finance.summary.income")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-2.5 rounded-sm bg-[var(--fg)] opacity-30" aria-hidden />
          {t("finance.summary.expenses")}
        </span>
      </figcaption>
      <div className="flex gap-2">
        {/* Eje: importe de las tres líneas de referencia. */}
        <div className="relative h-40 w-12 shrink-0 text-right" aria-hidden>
          {referencias.map((r, i) => (
            <span
              key={i}
              className="text-muted absolute right-0 -translate-y-1/2 text-[10px] tabular-nums sm:text-[11px]"
              style={{ top: `${(i / 2) * 100}%` }}
            >
              {euros(Math.round(r))}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40" aria-hidden>
            {referencias.map((_, i) => (
              <div
                key={i}
                className={`absolute inset-x-0 border-t ${i === 2 ? "border-[var(--rule)]" : "border-dashed border-[var(--rule)] opacity-70"}`}
                style={{ top: `${(i / 2) * 100}%` }}
              />
            ))}
          </div>
          <ol className="relative grid grid-cols-12 gap-1 sm:gap-2">
            {serie.map((s, i) => (
              <li
                key={s.mes}
                role="img"
                tabIndex={0}
                aria-label={t("finance.summary.monthAria", {
                  month: etiqueta(s.mes, "long"),
                  income: euros(s.ingresos),
                  expenses: euros(s.gastos),
                })}
                className="group relative rounded-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              >
                <div className="flex h-40 items-end justify-center gap-0.5">
                  <div
                    className="barra-y w-full max-w-3 rounded-t-sm bg-[var(--accent)]"
                    style={
                      { height: `${(s.ingresos / maximo) * 100}%`, "--i": i } as React.CSSProperties
                    }
                    aria-hidden
                  />
                  <div
                    className="barra-y w-full max-w-3 rounded-t-sm bg-[var(--fg)] opacity-30"
                    style={
                      { height: `${(s.gastos / maximo) * 100}%`, "--i": i } as React.CSSProperties
                    }
                    aria-hidden
                  />
                </div>
                <p className="text-muted mt-1.5 text-center text-[11px] sm:text-xs" aria-hidden>
                  {etiqueta(s.mes, "short")}
                </p>
                <span
                  aria-hidden
                  className={`border-rule bg-paper pointer-events-none absolute bottom-full z-10 mb-1 rounded-lg border px-2.5 py-1.5 text-xs whitespace-nowrap tabular-nums opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${
                    i < 3 ? "left-0" : i > 8 ? "right-0" : "left-1/2 -translate-x-1/2"
                  }`}
                >
                  <span className="block font-semibold">{etiqueta(s.mes, "long")}</span>
                  <span className="block">
                    {t("finance.summary.income")} {euros(s.ingresos)}
                  </span>
                  <span className="block">
                    {t("finance.summary.expenses")} {euros(s.gastos)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </figure>
  );
}

/** Gasto por categoría con el aspecto de las barras de progreso de la zona privada. */
export async function BarrasCategoria({
  filas,
}: {
  filas: { categoria: string; total: number }[];
}) {
  const { t, euros } = await getI18n();
  const suma = filas.reduce((s, f) => s + f.total, 0);
  const maximo = Math.max(1, ...filas.map((f) => f.total));
  return (
    <ul className="grid gap-4">
      {filas.map((f) => {
        const nombre = t(`finance.category.${f.categoria}`);
        return (
          <li key={f.categoria}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
              <span>{nombre}</span>
              <span className="text-muted tabular-nums">
                {euros(f.total)} · {Math.round((f.total / suma) * 100)} %
              </span>
            </div>
            <ProgressBar value={f.total} max={maximo} label={nombre} />
          </li>
        );
      })}
    </ul>
  );
}

/** Enlace de descarga CSV que conserva el periodo en curso. */
export function EnlaceCsv({
  tipo,
  desde,
  hasta,
  children,
}: {
  tipo: "pagos" | "cobros" | "gastos";
  desde?: string;
  hasta?: string;
  children: React.ReactNode;
}) {
  const q = new URLSearchParams({ tipo });
  if (desde) q.set("desde", desde);
  if (hasta) q.set("hasta", hasta);
  return (
    <a href={`/admin/finanzas/exportar?${q}`} className="btn-secondary" download>
      {children}
    </a>
  );
}
