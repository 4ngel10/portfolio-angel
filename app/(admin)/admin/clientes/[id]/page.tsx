import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/portal/validate";
import { listarBolsas, listarEmpresas, listarProyectos } from "@/lib/portal/queries";
import { cobrosConEstado } from "@/lib/portal/finanzas-queries";
import { redondear } from "@/lib/portal/presupuestos";
import type { Empresa } from "@/lib/portal/types";
import { AnadirPersona } from "@/components/portal/anadir-persona";
import { EmpresaDetalles } from "@/components/portal/empresa-detalles";
import { PersonaCard, type PersonaInfo } from "@/components/portal/persona-card";
import {
  EmptyState,
  EstadoCobroBadge,
  EstadoProyectoBadge,
  PageHeader,
  Panel,
  ProgressBar,
} from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.clientsTitle") };
}

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { t, fecha, euros } = await getI18n();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("empresas").select("*").eq("id", id).maybeSingle();
  const empresa = data as Empresa | null;
  if (!empresa) notFound();

  const [{ data: usuarios }, proyectos, bolsas, empresas, auth, cobros] = await Promise.all([
    supabase
      .from("usuarios")
      .select("id, nombre, email, empresa_id")
      .eq("role", "cliente")
      .eq("empresa_id", id)
      .order("nombre"),
    listarProyectos(),
    listarBolsas(),
    listarEmpresas(),
    createAdminClient().auth.admin.listUsers({ perPage: 1000 }),
    cobrosConEstado({ empresaId: id }),
  ]);

  // Los cobros anulados no cuentan en los totales del cliente.
  const vivos = cobros.filter((c) => c.estado !== "anulado");
  const totalCobros = redondear(vivos.reduce((s, c) => s + c.cobro.importe, 0));
  const totalCobrado = redondear(vivos.reduce((s, c) => s + c.pagado, 0));
  const totalPendiente = redondear(vivos.reduce((s, c) => s + c.pendiente, 0));

  const cuentas = new Map((auth.data?.users ?? []).map((u) => [u.id, u]));
  const ahora = Date.now();
  const personas: PersonaInfo[] = (usuarios ?? []).map((u) => {
    const cuenta = cuentas.get(u.id);
    const meta = cuenta?.user_metadata ?? {};
    return {
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      empresa_id: u.empresa_id,
      desactivada: !!cuenta?.banned_until && new Date(cuenta.banned_until).getTime() > ahora,
      alta: cuenta?.created_at ?? null,
      ultimoAcceso: cuenta?.last_sign_in_at ?? null,
      contrasena:
        meta.password_temporary === true
          ? "provisional"
          : meta.password_set
            ? "propia"
            : "pendiente",
    };
  });
  const suyos = proyectos.filter((p) => p.empresa_id === id);
  const bolsa = bolsas.find((b) => b.empresa_id === id);

  return (
    <>
      <p className="mb-4 text-sm">
        <Link
          href="/admin/clientes"
          className="text-muted hover:text-ink underline-offset-4 hover:underline"
        >
          {t("admin.back")}
        </Link>
      </p>
      <PageHeader
        title={empresa.nombre}
        intro={t("admin.customerSince", { date: fecha(empresa.created_at) })}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("admin.companyDetails")} className="lg:col-span-2">
          <EmpresaDetalles empresa={empresa} />
        </Panel>

        <Panel
          title={t("admin.people")}
          className="lg:col-span-2"
          action={<AnadirPersona empresaId={empresa.id} empresaNombre={empresa.nombre} />}
        >
          {personas.length === 0 ? (
            <EmptyState>{t("admin.nobody")}</EmptyState>
          ) : (
            <ul className="grid gap-3">
              {personas.map((p) => (
                <li key={p.id}>
                  <PersonaCard persona={p} empresas={empresas} t={t} fecha={fecha} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t("admin.hourBank")}
          action={
            <Link
              href="/admin/horas"
              className="hover:text-accent text-sm underline underline-offset-4"
            >
              {t("admin.manage")}
            </Link>
          }
        >
          {bolsa ? (
            <>
              <p className="text-2xl font-semibold">
                {Math.max(0, bolsa.horas_contratadas - bolsa.horas_consumidas)}
                <span className="text-muted ml-1 text-sm font-normal">
                  {t("admin.availOf", { total: bolsa.horas_contratadas })}
                </span>
              </p>
              <div className="mt-3">
                <ProgressBar
                  value={bolsa.horas_consumidas}
                  max={bolsa.horas_contratadas}
                  label={t("home.consumedHours")}
                />
              </div>
            </>
          ) : (
            <EmptyState>{t("admin.noBank")}</EmptyState>
          )}
        </Panel>

        <Panel title={t("admin.projectsTitle")}>
          {suyos.length === 0 ? (
            <EmptyState>{t("admin.noCompanyProjects")}</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--rule)]">
              {suyos.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <Link
                    href={`/admin/proyectos/${p.id}`}
                    className="hover:text-accent font-medium underline-offset-4 hover:underline"
                  >
                    {p.titulo}
                  </Link>
                  <EstadoProyectoBadge estado={p.estado} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t("finance.collections.title")}
          className="lg:col-span-2"
          action={
            <Link
              href={`/admin/finanzas/cobros?empresa=${id}#nuevo`}
              className="hover:text-accent text-sm underline underline-offset-4"
            >
              {t("finance.collections.new")}
            </Link>
          }
        >
          {cobros.length === 0 ? (
            <EmptyState>{t("finance.collections.noneClient")}</EmptyState>
          ) : (
            <>
              <dl className="mb-4 grid grid-cols-3 gap-4 text-sm">
                <div>
                  <dt className="text-muted">{t("finance.client.total")}</dt>
                  <dd className="font-semibold tabular-nums">{euros(totalCobros)}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t("finance.cols.collected")}</dt>
                  <dd className="font-semibold tabular-nums">{euros(totalCobrado)}</dd>
                </div>
                <div>
                  <dt className="text-muted">{t("finance.cols.pending")}</dt>
                  <dd className="font-semibold tabular-nums">{euros(totalPendiente)}</dd>
                </div>
              </dl>
              <ul className="divide-y divide-[var(--rule)]">
                {cobros.slice(0, 5).map(({ cobro, pendiente, estado }) => (
                  <li
                    key={cobro.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`/admin/finanzas/cobros/${cobro.id}`}
                      className="hover:text-accent min-w-0 font-medium underline-offset-4 hover:underline"
                    >
                      {cobro.concepto}
                    </Link>
                    <span className="flex items-center gap-3 text-sm">
                      <span className="text-muted tabular-nums">
                        {t("finance.collections.pendingAmount", { amount: euros(pendiente) })}
                      </span>
                      <EstadoCobroBadge estado={estado} />
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>
      </div>
    </>
  );
}
