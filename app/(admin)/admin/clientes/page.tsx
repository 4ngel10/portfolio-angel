import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { listarBolsas, listarEmpresas, listarProyectos } from "@/lib/portal/queries";
import { cobrosConEstado } from "@/lib/portal/finanzas-queries";
import { redondear } from "@/lib/portal/presupuestos";
import { NuevoCliente } from "@/components/portal/nuevo-cliente";
import { EmptyState, PageHeader, ProgressBar } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.clientsTitle") };
}

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ nuevo?: string; archivados?: string; eliminado?: string }>;
}) {
  await requireAdmin();
  const { t, fecha, euros, num } = await getI18n();
  const { nuevo, archivados, eliminado } = await searchParams;
  const verArchivados = archivados === "1";
  const supabase = await createClient();
  const [todas, proyectos, bolsas, cobros, { data: usuarios }] = await Promise.all([
    listarEmpresas({ todas: true }),
    listarProyectos(),
    listarBolsas(),
    cobrosConEstado(),
    supabase.from("usuarios").select("id, empresa_id").eq("role", "cliente"),
  ]);

  const empresas = todas.filter((e) => !e.archivada_at);
  const archivadas = todas.filter((e) => e.archivada_at);
  const filas = (verArchivados ? archivadas : empresas).map((e) => {
    const bolsa = bolsas.find((b) => b.empresa_id === e.id);
    const abiertos = cobros.filter(
      (c) => c.cobro.empresa_id === e.id && ["pendiente", "parcial", "vencido"].includes(c.estado),
    );
    return {
      empresa: e,
      personas: (usuarios ?? []).filter((u) => u.empresa_id === e.id).length,
      activos: proyectos.filter((p) => p.empresa_id === e.id && p.estado === "activo").length,
      bolsa,
      restantes: bolsa
        ? Math.max(0, Math.round((bolsa.horas_contratadas - bolsa.horas_consumidas) * 100) / 100)
        : 0,
      pendiente: redondear(abiertos.reduce((s, c) => s + c.pendiente, 0)),
      vencido: abiertos.some((c) => c.estado === "vencido"),
    };
  });

  const horas = (f: (typeof filas)[number]) =>
    f.bolsa ? (
      <div className="min-w-[8rem]">
        <p className="tabular-nums">
          {t("admin.leftOf", { left: num(f.restantes), total: num(f.bolsa.horas_contratadas) })}
        </p>
        <div className="mt-1.5 max-w-[9rem]">
          <ProgressBar
            value={f.bolsa.horas_consumidas}
            max={f.bolsa.horas_contratadas}
            label={`${t("home.consumedHours")}: ${f.empresa.nombre}`}
          />
        </div>
      </div>
    ) : (
      <span className="text-muted">{t("admin.noBankShort")}</span>
    );
  const cobro = (f: (typeof filas)[number]) => (
    <span
      className={`tabular-nums ${f.vencido ? "font-medium text-[var(--accent)]" : f.pendiente === 0 ? "text-muted" : ""}`}
    >
      {euros(f.pendiente)}
    </span>
  );

  return (
    <>
      <PageHeader
        title={t("admin.clientsTitle")}
        action={
          <NuevoCliente
            empresas={empresas.map((e) => ({ id: e.id, nombre: e.nombre }))}
            abrirAlCargar={nuevo === "1"}
          />
        }
      />

      {eliminado === "1" ? (
        <p
          role="status"
          className="border-rule bg-paper-alt mb-5 rounded-xl border px-4 py-3 text-sm"
        >
          {t("ok.clientDeleted")}
        </p>
      ) : null}

      {/* Activos o archivados. Los archivados no salen en el resto del panel. */}
      {archivadas.length > 0 || verArchivados ? (
        <nav aria-label={t("admin.clientsFilter")} className="mb-5 flex gap-1 text-sm">
          {[
            { href: "/admin/clientes", activo: !verArchivados, label: t("admin.filterActive") },
            {
              href: "/admin/clientes?archivados=1",
              activo: verArchivados,
              label: t("admin.filterArchived", { n: archivadas.length }),
            },
          ].map((f) => (
            <Link
              key={f.href}
              href={f.href}
              aria-current={f.activo ? "page" : undefined}
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                f.activo ? "bg-chip text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </nav>
      ) : null}

      {filas.length === 0 ? (
        <EmptyState>{verArchivados ? t("admin.noArchived") : t("admin.noCompanies")}</EmptyState>
      ) : (
        <>
          {/* Escritorio: tabla a todo el ancho. Cada fila entera es el enlace a la ficha. */}
          <div className="border-rule bg-paper-alt hidden overflow-x-auto rounded-2xl border md:block">
            <table className="w-full text-left text-sm">
              <thead className="text-muted border-rule border-b">
                <tr>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {t("admin.colCompany")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("admin.colPeople")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("admin.colActiveProjects")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("admin.colHoursLeft")}
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    {t("admin.colPendingCollect")}
                  </th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    {t("admin.colSince")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--rule)]">
                {filas.map((f) => (
                  <tr
                    key={f.empresa.id}
                    className="relative transition-colors duration-150 hover:bg-[var(--chip)] has-[a:focus-visible]:outline-2 has-[a:focus-visible]:-outline-offset-2 has-[a:focus-visible]:outline-[var(--accent)]"
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/clientes/${f.empresa.id}`}
                        className="font-medium after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                      >
                        {f.empresa.nombre}
                      </Link>
                    </td>
                    <td className="px-3 py-3.5 tabular-nums">{f.personas}</td>
                    <td className="px-3 py-3.5 tabular-nums">{f.activos}</td>
                    <td className="px-3 py-3.5">{horas(f)}</td>
                    <td className="px-3 py-3.5">{cobro(f)}</td>
                    <td className="text-muted px-5 py-3.5">{fecha(f.empresa.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Móvil: tarjetas apiladas con los mismos datos. */}
          <ul className="grid gap-3 md:hidden">
            {filas.map((f) => (
              <li key={f.empresa.id}>
                <Link
                  href={`/admin/clientes/${f.empresa.id}`}
                  className="border-rule bg-paper-alt block rounded-2xl border p-4 transition-colors hover:border-[var(--fg)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <p className="font-semibold">{f.empresa.nombre}</p>
                  <p className="text-muted mt-0.5 text-xs">
                    {t("admin.colSince")} {fecha(f.empresa.created_at)}
                  </p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <dt className="text-muted text-xs">{t("admin.colPeople")}</dt>
                      <dd className="tabular-nums">{f.personas}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-xs">{t("admin.colActiveProjects")}</dt>
                      <dd className="tabular-nums">{f.activos}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-xs">{t("admin.colHoursLeft")}</dt>
                      <dd>{horas(f)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted text-xs">{t("admin.colPendingCollect")}</dt>
                      <dd>{cobro(f)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
