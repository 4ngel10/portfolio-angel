import Link from "next/link";
import type { Metadata } from "next";
import { requireCliente } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { cargarIncidencias, listarBolsas, listarHitos, listarProyectos, mapaTitulos, progreso } from "@/lib/portal/queries";
import { EmptyState, EstadoProyectoBadge, PageHeader, Panel, ProgressBar } from "@/components/portal/ui";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("nav.projects") };
}

export default async function PortalPage() {
  const perfil = await requireCliente();
  const { t, fecha } = await getI18n();
  const proyectos = await listarProyectos();
  const [hitos, bolsas, { incidencias }] = await Promise.all([
    listarHitos(proyectos.map((p) => p.id)),
    listarBolsas(),
    cargarIncidencias({ soloAbiertas: true }),
  ]);

  const titulos = mapaTitulos(proyectos);
  const tuTurno = hitos.filter((h) => h.pelota_en === "cliente" && !h.completado);
  const bolsa = bolsas[0];
  const restantes = bolsa ? Math.max(0, bolsa.horas_contratadas - bolsa.horas_consumidas) : null;

  return (
    <>
      <PageHeader title={t("home.greeting", { name: perfil.nombre.split(" ")[0] })} intro={t("home.intro")} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid content-start gap-6">
          <Aparece>
            <Panel title={t("home.yourTurn")}>
              {tuTurno.length === 0 ? (
                <EmptyState>{t("home.nothingPending")}</EmptyState>
              ) : (
                <ul className="grid gap-2">
                  {tuTurno.map((h) => (
                    <li key={h.id} className="rounded-xl border border-rule bg-paper p-4">
                      <p className="font-medium">{h.titulo}</p>
                      {h.descripcion ? <p className="mt-1 text-sm text-muted">{h.descripcion}</p> : null}
                      <p className="mt-2 text-xs text-muted">
                        <Link href={`/portal/proyecto/${h.proyecto_id}`} className="underline-offset-4 hover:text-accent hover:underline">
                          {titulos[h.proyecto_id]}
                        </Link>
                        {h.fecha_objetivo ? ` · ${t("home.dueDate", { date: fecha(h.fecha_objetivo) })}` : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </Aparece>

          <Aparece retraso={0.05}>
            <Panel title={t("home.projects")}>
              {proyectos.length === 0 ? (
                <EmptyState>{t("home.noProjects")}</EmptyState>
              ) : (
                <ul className="grid gap-3">
                  {proyectos.map((p) => {
                    const { hechos, total } = progreso(hitos, p.id);
                    return (
                      <li key={p.id}>
                        <Link
                          href={`/portal/proyecto/${p.id}`}
                          className="block rounded-xl border border-rule bg-paper p-4 transition-[color,border-color,background-color,opacity,transform] duration-150 ease-[var(--ease-out)] hover:border-[var(--fg)] active:scale-[0.99]"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="font-semibold">{p.titulo}</h3>
                            <EstadoProyectoBadge estado={p.estado} />
                          </div>
                          {p.descripcion ? <p className="mt-1 line-clamp-2 text-sm text-muted">{p.descripcion}</p> : null}
                          <div className="mt-3 flex items-center gap-3">
                            <div className="flex-1">
                              <ProgressBar value={hechos} max={total} label={t("home.progressOf", { title: p.titulo })} />
                            </div>
                            <span className="text-xs text-muted">
                              {total === 0 ? t("home.noMilestones") : t("home.milestonesProgress", { done: hechos, total })}
                            </span>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </Aparece>
        </div>

        <aside className="grid content-start gap-6">
          <Aparece retraso={0.1}>
            <Panel title={t("home.hourBank")}>
              {bolsa && restantes !== null ? (
                <>
                  <p className="text-3xl font-semibold tracking-tight">
                    {restantes}
                    <span className="ml-1 text-base font-normal text-muted">{t("home.hoursAvailable")}</span>
                  </p>
                  <div className="mt-3">
                    <ProgressBar value={bolsa.horas_consumidas} max={bolsa.horas_contratadas} label={t("home.consumedHours")} />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {t("home.usedOfTotal", { used: bolsa.horas_consumidas, total: bolsa.horas_contratadas })}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted">{t("home.noBank")}</p>
              )}
              <Link href="/portal/horas" className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-accent">
                {t("home.viewDetail")}
              </Link>
            </Panel>
          </Aparece>

          <Aparece retraso={0.15}>
            <Panel title={t("home.incidents")}>
              <p className="text-3xl font-semibold tracking-tight">
                {incidencias.length}
                <span className="ml-1 text-base font-normal text-muted">
                  {incidencias.length === 1 ? t("home.openOne") : t("home.openMany")}
                </span>
              </p>
              <Link href="/portal/incidencias" className="mt-4 inline-block text-sm font-medium underline underline-offset-4 hover:text-accent">
                {incidencias.length ? t("home.viewIncidents") : t("home.openIncident")}
              </Link>
            </Panel>
          </Aparece>
        </aside>
      </div>
    </>
  );
}
