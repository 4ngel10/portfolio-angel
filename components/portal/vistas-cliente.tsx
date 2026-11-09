import Link from "next/link";
import { getI18n } from "@/lib/portal/i18n";
import { progreso } from "@/lib/portal/queries";
import { totales } from "@/lib/portal/presupuestos";
import type {
  BolsaHoras as BolsaHorasFila,
  BolsaMovimiento,
  Hito,
  Presupuesto,
  PresupuestoLinea,
  Proyecto,
} from "@/lib/portal/types";
import { MovimientosPorMes } from "./movimientos";
import { EmptyState, EstadoPresupuestoBadge, EstadoProyectoBadge, Panel, ProgressBar } from "./ui";

/*
 * Contenido de las pantallas del portal del cliente, como componentes que reciben los datos por
 * props. Los usan las páginas del portal (con enlaces a cada proyecto y presupuesto) y la vista de
 * cliente del admin (solo lectura, sin enlaces), así las dos se ven igual.
 */

const claseTarjeta =
  "border-rule bg-paper block rounded-xl border p-4 transition-[color,border-color,background-color,opacity,transform] duration-150 ease-[var(--ease-out)] hover:border-[var(--fg)] active:scale-[0.99]";

/** "Te toca a ti": hitos que esperan una respuesta del cliente. */
export async function PanelTuTurno({
  proyectos,
  hitos,
  enlaces,
}: {
  proyectos: Proyecto[];
  hitos: Hito[];
  enlaces: boolean;
}) {
  const { t, fecha } = await getI18n();
  const titulos = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));
  const tuTurno = hitos.filter((h) => h.pelota_en === "cliente" && !h.completado);
  return (
    <Panel title={t("home.yourTurn")}>
      {tuTurno.length === 0 ? (
        <EmptyState>{t("home.nothingPending")}</EmptyState>
      ) : (
        <ul className="grid gap-2">
          {tuTurno.map((h) => (
            <li key={h.id} className="border-rule bg-paper rounded-xl border p-4">
              <p className="font-medium">{h.titulo}</p>
              {h.descripcion ? <p className="text-muted mt-1 text-sm">{h.descripcion}</p> : null}
              <p className="text-muted mt-2 text-xs">
                {enlaces ? (
                  <Link
                    href={`/portal/proyecto/${h.proyecto_id}`}
                    className="hover:text-accent underline-offset-4 hover:underline"
                  >
                    {titulos[h.proyecto_id]}
                  </Link>
                ) : (
                  titulos[h.proyecto_id]
                )}
                {h.fecha_objetivo
                  ? ` · ${t("home.dueDate", { date: fecha(h.fecha_objetivo) })}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

/** Lista de proyectos con su estado y el progreso de hitos. */
export async function PanelProyectos({
  proyectos,
  hitos,
  enlaces,
}: {
  proyectos: Proyecto[];
  hitos: Hito[];
  enlaces: boolean;
}) {
  const { t } = await getI18n();
  return (
    <Panel title={t("home.projects")}>
      {proyectos.length === 0 ? (
        <EmptyState>{t("home.noProjects")}</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {proyectos.map((p) => {
            const { hechos, total } = progreso(hitos, p.id);
            const contenido = (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{p.titulo}</h3>
                  <EstadoProyectoBadge estado={p.estado} />
                </div>
                {p.descripcion ? (
                  <p className="text-muted mt-1 line-clamp-2 text-sm">{p.descripcion}</p>
                ) : null}
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1">
                    <ProgressBar
                      value={hechos}
                      max={total}
                      label={t("home.progressOf", { title: p.titulo })}
                    />
                  </div>
                  <span className="text-muted text-xs">
                    {total === 0
                      ? t("home.noMilestones")
                      : t("home.milestonesProgress", { done: hechos, total })}
                  </span>
                </div>
              </>
            );
            return (
              <li key={p.id}>
                {enlaces ? (
                  <Link href={`/portal/proyecto/${p.id}`} className={claseTarjeta}>
                    {contenido}
                  </Link>
                ) : (
                  <div className="border-rule bg-paper rounded-xl border p-4">{contenido}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

/** Bolsa de horas: saldo, contratadas y consumidas, y el registro de movimientos por mes. */
export async function BolsaDeHoras({
  bolsa,
  movimientos,
  proyectos,
}: {
  bolsa: BolsaHorasFila | undefined;
  movimientos: BolsaMovimiento[];
  proyectos: Proyecto[];
}) {
  const { t, euros, fecha, horas, num, mes } = await getI18n();
  const titulos = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));
  return (
    <>
      <Panel>
        {!bolsa ? (
          <EmptyState>{t("hoursPage.none")}</EmptyState>
        ) : (
          <>
            <p className="text-5xl font-semibold tracking-tight">
              {num(
                Math.max(
                  0,
                  Math.round((bolsa.horas_contratadas - bolsa.horas_consumidas) * 100) / 100,
                ),
              )}
              <span className="text-muted ml-2 text-lg font-normal">
                {t("hoursPage.available")}
              </span>
            </p>
            <div className="mt-5 max-w-xl">
              <ProgressBar
                value={bolsa.horas_consumidas}
                max={bolsa.horas_contratadas}
                label={t("home.consumedHours")}
              />
            </div>
            <dl className="mt-6 grid max-w-xl grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-muted">{t("hoursPage.contracted")}</dt>
                <dd className="mt-0.5 text-lg font-semibold">{horas(bolsa.horas_contratadas)}</dd>
              </div>
              <div>
                <dt className="text-muted">{t("hoursPage.consumed")}</dt>
                <dd className="mt-0.5 text-lg font-semibold">{horas(bolsa.horas_consumidas)}</dd>
              </div>
              {bolsa.precio !== null ? (
                <div>
                  <dt className="text-muted">{t("hoursPage.price")}</dt>
                  <dd className="mt-0.5 text-lg font-semibold">{euros(bolsa.precio)}</dd>
                </div>
              ) : null}
            </dl>
          </>
        )}
      </Panel>

      {bolsa ? (
        <Panel title={t("hoursPage.movements")} className="mt-6">
          {movimientos.length === 0 ? (
            <EmptyState>{t("hoursPage.noMovements")}</EmptyState>
          ) : (
            <MovimientosPorMes
              movimientos={movimientos}
              proyectos={titulos}
              mesLabel={mes}
              t={t}
              fecha={fecha}
              horas={horas}
            />
          )}
        </Panel>
      ) : null}
    </>
  );
}

/** Resumen por estado y lista de presupuestos (los que el cliente puede ver). */
export async function ListaPresupuestos({
  presupuestos,
  lineas,
  enlaces,
}: {
  presupuestos: Presupuesto[];
  lineas: PresupuestoLinea[];
  enlaces: boolean;
}) {
  const { t, fecha, euros } = await getI18n();
  const totalDe = (p: Presupuesto) =>
    totales(
      lineas.filter((l) => l.presupuesto_id === p.id),
      p.descuento,
      p.iva,
    ).total;
  const suma = (estado: string) =>
    presupuestos.filter((p) => p.estado === estado).reduce((s, p) => s + totalDe(p), 0);
  const cuenta = (estado: string) => presupuestos.filter((p) => p.estado === estado).length;

  return (
    <div className="grid gap-6">
      {presupuestos.length > 0 ? (
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
      ) : null}

      <Panel title={t("quotes.all")}>
        {presupuestos.length === 0 ? (
          <EmptyState>{t("quotes.clientNone")}</EmptyState>
        ) : (
          <ul className="divide-y divide-[var(--rule)]">
            {presupuestos.map((p) => {
              const fila = (
                <>
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
                </>
              );
              const clase = "flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3";
              return (
                <li key={p.id}>
                  {enlaces ? (
                    <Link
                      href={`/portal/presupuestos/${p.id}`}
                      className={`${clase} hover:bg-chip -mx-2 rounded-lg px-2 transition-colors`}
                    >
                      {fila}
                    </Link>
                  ) : (
                    <div className={clase}>{fila}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
