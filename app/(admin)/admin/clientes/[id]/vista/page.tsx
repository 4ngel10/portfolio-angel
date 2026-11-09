import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import {
  cargarIncidencias,
  listarBolsas,
  listarHitos,
  listarLineasPresupuesto,
  listarMovimientos,
  listarPresupuestos,
  listarProyectos,
  progreso,
} from "@/lib/portal/queries";
import { totales } from "@/lib/portal/presupuestos";
import { isUuid } from "@/lib/portal/validate";
import type { Empresa } from "@/lib/portal/types";
import { IncidenciasLista } from "@/components/portal/listas";
import { MovimientosPorMes } from "@/components/portal/movimientos";
import {
  EmptyState,
  EstadoPresupuestoBadge,
  EstadoProyectoBadge,
  Panel,
  ProgressBar,
} from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.viewAsClient") };
}

/**
 * Lo que ve el cliente en su portal, para una empresa. Solo lectura y sin cambiar de sesión: son
 * las mismas consultas del admin filtradas por empresa_id, pintadas con los componentes del portal.
 */
export default async function VistaClientePage({ params }: { params: Promise<{ id: string }> }) {
  const perfil = await requireAdmin();
  const { t, fecha, euros, num, horas, mes } = await getI18n();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("empresas").select("*").eq("id", id).maybeSingle();
  const empresa = data as Empresa | null;
  if (!empresa) notFound();

  const [todosProyectos, todosHitos, bolsas, movimientos, todosPresupuestos, lineas, inc] =
    await Promise.all([
      listarProyectos(),
      listarHitos(),
      listarBolsas(),
      listarMovimientos({ empresaId: id }),
      listarPresupuestos(),
      listarLineasPresupuesto(),
      cargarIncidencias(),
    ]);
  const proyectos = todosProyectos.filter((p) => p.empresa_id === id);
  const ids = new Set(proyectos.map((p) => p.id));
  const hitos = todosHitos.filter((h) => ids.has(h.proyecto_id));
  const bolsa = bolsas.find((b) => b.empresa_id === id);
  // El cliente nunca ve los borradores.
  const presupuestos = todosPresupuestos.filter(
    (p) => p.empresa_id === id && p.estado !== "borrador",
  );
  const incidencias = inc.incidencias.filter((i) => i.empresa_id === id);
  const mensajes = inc.mensajes.filter((m) => incidencias.some((i) => i.id === m.incidencia_id));
  const titulos = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));
  const totalDe = (p: (typeof presupuestos)[number]) =>
    totales(
      lineas.filter((l) => l.presupuesto_id === p.id),
      p.descuento,
      p.iva,
    ).total;
  const restantes = bolsa
    ? Math.max(0, Math.round((bolsa.horas_contratadas - bolsa.horas_consumidas) * 100) / 100)
    : 0;

  return (
    <>
      {/* Banda fija: deja claro que es la vista del cliente y cómo volver. */}
      <div
        role="status"
        className="sticky top-0 z-30 -mx-4 mb-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[var(--accent)] bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white md:-mx-8 md:px-8 dark:text-[#0a0f1c]"
      >
        <span>
          {t("admin.viewingBanner", { company: empresa.nombre })}
          <span className="ml-2 font-normal opacity-90">{t("admin.viewingReadOnly")}</span>
        </span>
        <Link
          href={`/admin/clientes/${id}`}
          className="rounded-lg bg-white/15 px-3.5 py-1.5 font-semibold underline-offset-4 transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t("admin.backToProfile")}
        </Link>
      </div>

      <div className="grid gap-6">
        <Panel title={t("hoursPage.title")}>
          {!bolsa ? (
            <EmptyState>{t("hoursPage.none")}</EmptyState>
          ) : (
            <>
              <p className="text-4xl font-semibold tracking-tight">
                {num(restantes)}
                <span className="text-muted ml-2 text-base font-normal">
                  {t("hoursPage.available")}
                </span>
              </p>
              <div className="mt-4 max-w-xl">
                <ProgressBar
                  value={bolsa.horas_consumidas}
                  max={bolsa.horas_contratadas}
                  label={t("home.consumedHours")}
                />
              </div>
              <dl className="mt-5 grid max-w-xl grid-cols-2 gap-4 text-sm sm:grid-cols-3">
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
              {movimientos.length > 0 ? (
                <div className="border-rule mt-6 border-t pt-5">
                  <h3 className="mb-3 font-semibold">{t("hoursPage.movements")}</h3>
                  <MovimientosPorMes
                    movimientos={movimientos}
                    proyectos={titulos}
                    mesLabel={mes}
                    t={t}
                    fecha={fecha}
                    horas={horas}
                  />
                </div>
              ) : null}
            </>
          )}
        </Panel>

        <Panel title={t("admin.viewSectionProjects")}>
          {proyectos.length === 0 ? (
            <EmptyState>{t("admin.noCompanyProjects")}</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--rule)]">
              {proyectos.map((p) => {
                const { hechos, total } = progreso(hitos, p.id);
                return (
                  <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{p.titulo}</span>
                      <EstadoProyectoBadge estado={p.estado} />
                    </div>
                    {p.descripcion ? (
                      <p className="text-muted mt-1 text-sm">{p.descripcion}</p>
                    ) : null}
                    {total > 0 ? (
                      <div className="mt-2.5 max-w-sm">
                        <ProgressBar value={hechos} max={total} label={p.titulo} />
                        <p className="text-muted mt-1 text-xs tabular-nums">
                          {hechos}/{total}
                        </p>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title={t("project.incidents")}>
          <IncidenciasLista
            incidencias={incidencias}
            mensajes={mensajes}
            autores={inc.autores}
            proyectos={titulos}
            perfilId={perfil.id}
            soloLectura
            rutaProyecto="/admin/proyectos"
          />
        </Panel>

        <Panel title={t("admin.viewSectionQuotes")}>
          {presupuestos.length === 0 ? (
            <EmptyState>{t("quotes.clientNone")}</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--rule)]">
              {presupuestos.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3 first:pt-0 last:pb-0"
                >
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
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
