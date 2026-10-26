import type { ReactNode } from "react";
import { getI18n } from "@/lib/portal/i18n";
import type {
  EstadoCobro,
  EstadoIncidencia,
  OrigenCobro,
  EstadoPresupuesto,
  EstadoProyecto,
  Pelota,
  Prioridad,
} from "@/lib/portal/types";

export function fmtTamanio(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PageHeader({
  title,
  intro,
  action,
}: {
  title: string;
  intro?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        {intro ? <p className="text-muted mt-2 max-w-[60ch]">{intro}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  children,
  action,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`border-rule bg-paper-alt rounded-2xl border p-5 md:p-6 ${className}`}>
      {title || action ? (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title ? <h2 className="text-lg font-semibold tracking-tight">{title}</h2> : <span />}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="border-rule text-muted rounded-xl border border-dashed px-4 py-6 text-center text-sm">
      {children}
    </p>
  );
}

const dot = "inline-block size-1.5 shrink-0 rounded-full";

function Badge({ children, tone }: { children: ReactNode; tone: "accent" | "ink" | "muted" }) {
  const color =
    tone === "accent"
      ? "bg-[var(--accent)]"
      : tone === "ink"
        ? "bg-[var(--fg)]"
        : "bg-[var(--muted)]";
  const text = tone === "muted" ? "text-muted" : "text-ink";
  return (
    <span
      className={`border-rule inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors duration-200 ${text}`}
    >
      <span className={`${dot} ${color} transition-colors duration-200`} aria-hidden />
      {children}
    </span>
  );
}

export async function EstadoProyectoBadge({ estado }: { estado: EstadoProyecto }) {
  const { t } = await getI18n();
  const map = {
    activo: [t("status.active"), "ink"],
    pausado: [t("status.paused"), "muted"],
    completado: [t("status.completed"), "muted"],
  } as const;
  return <Badge tone={map[estado][1]}>{map[estado][0]}</Badge>;
}

export async function EstadoIncidenciaBadge({ estado }: { estado: EstadoIncidencia }) {
  const { t } = await getI18n();
  const map = {
    abierta: [t("status.open"), "accent"],
    en_progreso: [t("status.inProgress"), "ink"],
    resuelta: [t("status.resolved"), "muted"],
  } as const;
  return <Badge tone={map[estado][1]}>{map[estado][0]}</Badge>;
}

export async function EstadoPresupuestoBadge({ estado }: { estado: EstadoPresupuesto }) {
  const { t } = await getI18n();
  const map = {
    borrador: [t("quotes.status.borrador"), "muted"],
    enviado: [t("quotes.status.enviado"), "accent"],
    aceptado: [t("quotes.status.aceptado"), "ink"],
    rechazado: [t("quotes.status.rechazado"), "muted"],
  } as const;
  return <Badge tone={map[estado][1]}>{map[estado][0]}</Badge>;
}

/** Vencido llama la atención con el acento; lo pendiente va en tinta; lo cerrado, atenuado. */
export async function EstadoCobroBadge({ estado }: { estado: EstadoCobro }) {
  const { t } = await getI18n();
  const map = {
    pendiente: [t("finance.status.pendiente"), "ink"],
    parcial: [t("finance.status.parcial"), "ink"],
    vencido: [t("finance.status.vencido"), "accent"],
    pagado: [t("finance.status.pagado"), "muted"],
    anulado: [t("finance.status.anulado"), "muted"],
  } as const;
  return <Badge tone={map[estado][1]}>{map[estado][0]}</Badge>;
}

/** De dónde sale un cobro, o "suscripción" en los gastos que genera el cron. */
export async function OrigenBadge({ origen }: { origen: OrigenCobro | "suscripcion" }) {
  const { t } = await getI18n();
  return <Badge tone="muted">{t(`finance.origin.${origen}`)}</Badge>;
}

export async function PrioridadBadge({ prioridad }: { prioridad: Prioridad }) {
  const { t } = await getI18n();
  const map = { baja: t("status.low"), media: t("status.medium"), alta: t("status.high") } as const;
  return <Badge tone={prioridad === "alta" ? "accent" : "muted"}>{map[prioridad]}</Badge>;
}

/** Quién tiene la pelota: el cliente (acción suya) o el equipo. */
export async function PelotaBadge({
  pelota,
  vista,
}: {
  pelota: Pelota;
  vista: "cliente" | "admin";
}) {
  const { t } = await getI18n();
  const label =
    vista === "cliente"
      ? pelota === "cliente"
        ? t("status.yourTurn")
        : t("status.withTeam")
      : pelota === "cliente"
        ? t("status.ballClient")
        : t("status.ballTeam");
  return <Badge tone={pelota === "cliente" ? "accent" : "muted"}>{label}</Badge>;
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className="bg-chip h-1.5 w-full overflow-hidden rounded-full"
    >
      {/* scaleX en vez de width: solo transform, sin recalcular el layout. */}
      <div
        className="h-full w-full origin-left bg-[var(--accent)] transition-transform duration-[250ms] ease-[var(--ease-out)]"
        style={{ transform: `scaleX(${pct / 100})` }}
      />
    </div>
  );
}

export function CheckIcon({ done }: { done: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-5 shrink-0 transition-colors duration-200 ${done ? "text-[var(--accent)]" : "text-muted"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      {done ? <path d="m8 12.5 2.8 2.8L16 9.5" /> : null}
    </svg>
  );
}
