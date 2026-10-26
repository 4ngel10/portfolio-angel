import Link from "next/link";
import { getI18n } from "@/lib/portal/i18n";
import { PERIODOS, type ClavePeriodo } from "@/lib/portal/finanzas";
import { ProgressBar } from "./ui";

/** Cifra del resumen. Con `aviso` el importe va en el acento (por ejemplo, lo vencido). */
export function KpiTile({
  label,
  value,
  aviso = false,
  hint,
}: {
  label: string;
  value: string;
  aviso?: boolean;
  hint?: string;
}) {
  return (
    <div className="border-rule bg-paper-alt rounded-xl border p-4">
      <dt className="text-muted text-sm">{label}</dt>
      <dd
        className={`mt-1 text-2xl font-semibold tracking-tight tabular-nums ${aviso ? "text-[var(--accent)]" : ""}`}
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

/**
 * Ingresos frente a gastos de los últimos 12 meses. Dibujado a mano con CSS: dos barras por
 * mes sobre un máximo común y base en cero. Cada mes lleva su texto equivalente.
 */
export async function BarrasMensuales({
  serie,
}: {
  serie: { mes: string; ingresos: number; gastos: number }[];
}) {
  const { t, euros, locale } = await getI18n();
  const maximo = Math.max(1, ...serie.flatMap((s) => [s.ingresos, s.gastos]));
  const etiqueta = (mes: string, formato: "short" | "long") => {
    const [y, m] = mes.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, {
      month: formato,
      ...(formato === "long" ? { year: "numeric" } : {}),
      timeZone: "UTC",
    }).format(new Date(Date.UTC(y, m - 1, 1)));
  };

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
        <span className="tabular-nums">
          {t("finance.summary.scaleMax", { amount: euros(maximo) })}
        </span>
      </figcaption>
      <ol className="grid grid-cols-12 gap-1 sm:gap-2">
        {serie.map((s) => (
          <li
            key={s.mes}
            role="img"
            aria-label={t("finance.summary.monthAria", {
              month: etiqueta(s.mes, "long"),
              income: euros(s.ingresos),
              expenses: euros(s.gastos),
            })}
          >
            <div className="border-rule flex h-40 items-end justify-center gap-0.5 border-b">
              <div
                className="w-full max-w-3 rounded-t-sm bg-[var(--accent)]"
                style={{ height: `${(s.ingresos / maximo) * 100}%` }}
                aria-hidden
              />
              <div
                className="w-full max-w-3 rounded-t-sm bg-[var(--fg)] opacity-30"
                style={{ height: `${(s.gastos / maximo) * 100}%` }}
                aria-hidden
              />
            </div>
            <p className="text-muted mt-1.5 text-center text-[11px] sm:text-xs" aria-hidden>
              {etiqueta(s.mes, "short")}
            </p>
          </li>
        ))}
      </ol>
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
