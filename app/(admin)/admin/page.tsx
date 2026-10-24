import Link from "next/link";
import type { Metadata } from "next";
import { getI18n } from "@/lib/portal/i18n";
import {
  cargarIncidencias,
  listarBolsas,
  listarEmpresas,
  listarProyectos,
  mapaTitulos,
} from "@/lib/portal/queries";
import { requireAdmin } from "@/lib/portal/auth";
import {
  EmptyState,
  EstadoIncidenciaBadge,
  PageHeader,
  Panel,
  PrioridadBadge,
} from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.overview") };
}

export default async function AdminPage() {
  await requireAdmin();
  const { t, fechaHora } = await getI18n();
  const [empresas, proyectos, bolsas, { incidencias }] = await Promise.all([
    listarEmpresas(),
    listarProyectos(),
    listarBolsas(),
    cargarIncidencias({ soloAbiertas: true }),
  ]);

  const nombreEmpresa = Object.fromEntries(empresas.map((e) => [e.id, e.nombre]));
  const titulos = mapaTitulos(proyectos);
  const bajas = bolsas
    .filter(
      (b) =>
        b.horas_contratadas > 0 &&
        b.horas_contratadas - b.horas_consumidas <= b.horas_contratadas * 0.2,
    )
    .sort(
      (a, b) =>
        a.horas_contratadas - a.horas_consumidas - (b.horas_contratadas - b.horas_consumidas),
    );

  const cifras = [
    { n: empresas.length, l: t("admin.statClients"), href: "/admin/clientes" },
    {
      n: proyectos.filter((p) => p.estado === "activo").length,
      l: t("admin.statActive"),
      href: "/admin/proyectos",
    },
    { n: incidencias.length, l: t("admin.statOpen"), href: "#incidencias" },
    { n: bajas.length, l: t("admin.statLow"), href: "/admin/horas" },
  ];

  return (
    <>
      <PageHeader title={t("admin.overview")} />
      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cifras.map((c) => (
          <Link
            key={c.l}
            href={c.href}
            className="border-rule bg-paper-alt rounded-xl border p-4 transition-[color,border-color,background-color,opacity,transform] duration-150 ease-[var(--ease-out)] hover:border-[var(--fg)] active:scale-[0.98]"
          >
            <dd className="text-3xl font-semibold tracking-tight">{c.n}</dd>
            <dt className="text-muted mt-1 text-sm">{c.l}</dt>
          </Link>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div id="incidencias" className="scroll-mt-4">
          <Panel title={t("admin.openIncidents")}>
            {incidencias.length === 0 ? (
              <EmptyState>{t("admin.noOpen")}</EmptyState>
            ) : (
              <ul className="divide-y divide-[var(--rule)]">
                {incidencias.map((i) => (
                  <li key={i.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/admin/proyectos/${i.proyecto_id}`}
                      className="hover:text-accent font-medium underline-offset-4 hover:underline"
                    >
                      {i.titulo}
                    </Link>
                    <p className="text-muted mt-0.5 text-xs">
                      {nombreEmpresa[i.empresa_id]} · {titulos[i.proyecto_id]} ·{" "}
                      {fechaHora(i.created_at)}
                    </p>
                    <div className="mt-1.5 flex gap-2">
                      <EstadoIncidenciaBadge estado={i.estado} />
                      <PrioridadBadge prioridad={i.prioridad} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel title={t("admin.lowBanks")}>
          {bajas.length === 0 ? (
            <EmptyState>{t("admin.noneLow")}</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--rule)]">
              {bajas.map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/admin/clientes/${b.empresa_id}`}
                    className="hover:text-accent underline-offset-4 hover:underline"
                  >
                    {nombreEmpresa[b.empresa_id]}
                  </Link>
                  <span className="text-muted text-sm">
                    {t("admin.leftOf", {
                      left: Math.max(0, b.horas_contratadas - b.horas_consumidas),
                      total: b.horas_contratadas,
                    })}
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
