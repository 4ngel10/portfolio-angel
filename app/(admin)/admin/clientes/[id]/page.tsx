import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isUuid } from "@/lib/portal/validate";
import {
  listarBolsas,
  listarEmpresas,
  listarHitos,
  listarMovimientos,
  listarProyectos,
  progreso,
} from "@/lib/portal/queries";
import { cobrosConEstado } from "@/lib/portal/finanzas-queries";
import { redondear } from "@/lib/portal/presupuestos";
import type { Empresa } from "@/lib/portal/types";
import { inputCls, labelCls } from "@/components/portal/styles";
import { AnadirPersona } from "@/components/portal/anadir-persona";
import { EmpresaDatos } from "@/components/portal/empresa-datos";
import { MovimientosPorMes } from "@/components/portal/movimientos";
import { PersonaCard, type PersonaInfo } from "@/components/portal/persona-card";
import {
  EmptyState,
  EstadoCobroBadge,
  EstadoProyectoBadge,
  Panel,
  ProgressBar,
} from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.clientsTitle") };
}

export default async function ClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mes?: string }>;
}) {
  await requireAdmin();
  const { t, fecha, euros, horas, num, mes: mesLabel } = await getI18n();
  const { id } = await params;
  const { mes } = await searchParams;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("empresas").select("*").eq("id", id).maybeSingle();
  const empresa = data as Empresa | null;
  if (!empresa) notFound();

  const [{ data: usuarios }, proyectos, bolsas, empresas, auth, cobros, movimientos, hitos] =
    await Promise.all([
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
      listarMovimientos({ empresaId: id }),
      listarHitos(),
    ]);
  const meses = [...new Set(movimientos.map((m) => m.fecha.slice(0, 7)))];
  const mesElegido = mes && meses.includes(mes) ? mes : "";
  const visibles = mesElegido
    ? movimientos.filter((m) => m.fecha.startsWith(mesElegido))
    : movimientos;
  const titulos = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));

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
  const hitosSuyos = hitos.filter((h) => suyos.some((p) => p.id === h.proyecto_id));
  const bolsa = bolsas.find((b) => b.empresa_id === id);
  const restantes = bolsa
    ? Math.max(0, Math.round((bolsa.horas_contratadas - bolsa.horas_consumidas) * 100) / 100)
    : 0;
  const hayVencido = vivos.some((c) => c.estado === "vencido");

  const tile =
    "border-rule bg-paper-alt block h-full rounded-xl border px-4 py-2.5 transition-[color,border-color,background-color,opacity,transform] duration-150 ease-[var(--ease-out)] hover:border-[var(--fg)] active:scale-[0.98]";
  const numCls = "text-2xl leading-none font-semibold tracking-tight tabular-nums";
  const cifras = [
    { href: "#horas", n: bolsa ? num(restantes) : "-", l: t("admin.statHoursLeft"), barra: true },
    {
      href: "#proyectos",
      n: String(suyos.filter((p) => p.estado === "activo").length),
      l: t("admin.statActive"),
    },
    {
      href: "#cobros",
      n: euros(totalPendiente),
      l: t("admin.statPendingCollect"),
      acento: hayVencido,
    },
    { href: "#personas", n: String(personas.length), l: t("admin.people") },
  ];

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
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <h1 className="min-w-0 text-3xl font-semibold tracking-tight md:text-4xl">
            {empresa.nombre}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={`/admin/clientes/${id}/vista`}
              className="btn-secondary !px-4 !py-2 !text-sm"
            >
              {t("admin.viewAsClient")}
            </Link>
            <AnadirPersona empresaId={empresa.id} empresaNombre={empresa.nombre} />
          </div>
        </div>
        <p className="text-muted mt-2">
          {t("admin.customerSince", { date: fecha(empresa.created_at) })}
        </p>
      </header>

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cifras.map((c) => (
          <Link key={c.href} href={c.href} className={tile}>
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <dd className={`${numCls} ${c.acento ? "text-[var(--accent)]" : ""}`}>{c.n}</dd>
              <dt className="text-muted text-sm leading-snug">{c.l}</dt>
            </div>
            {c.barra && bolsa ? (
              <div className="mt-2">
                <ProgressBar
                  value={bolsa.horas_consumidas}
                  max={bolsa.horas_contratadas}
                  label={t("home.consumedHours")}
                />
              </div>
            ) : null}
          </Link>
        ))}
      </dl>

      {/* Por debajo de lg, una sola columna en el orden de "order-*". Desde lg, dos pilas
          independientes (los contenedores dejan de ser "contents"), para que no queden huecos
          entre paneles de distinta altura. */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] lg:items-start">
        <div className="contents lg:grid lg:content-start lg:gap-6">
          <div id="proyectos" className="order-2 scroll-mt-4">
            <Panel title={t("admin.projectsTitle")}>
              {suyos.length === 0 ? (
                <EmptyState>{t("admin.noCompanyProjects")}</EmptyState>
              ) : (
                <ul className="divide-y divide-[var(--rule)]">
                  {suyos.map((p) => {
                    const { hechos, total } = progreso(hitosSuyos, p.id);
                    return (
                      <li key={p.id} className="py-3 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between gap-3">
                          <Link
                            href={`/admin/proyectos/${p.id}`}
                            className="hover:text-accent min-w-0 font-medium underline-offset-4 hover:underline"
                          >
                            {p.titulo}
                          </Link>
                          <EstadoProyectoBadge estado={p.estado} />
                        </div>
                        {total > 0 ? (
                          <div className="mt-2 flex items-center gap-3">
                            <div className="max-w-xs flex-1">
                              <ProgressBar value={hechos} max={total} label={p.titulo} />
                            </div>
                            <span className="text-muted text-xs tabular-nums">
                              {hechos}/{total}
                            </span>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>

          {bolsa ? (
            <div id="movimientos" className="order-3 scroll-mt-4">
              <Panel title={t("admin.movementsTitle")}>
                {movimientos.length === 0 ? (
                  <EmptyState>{t("admin.noMovements")}</EmptyState>
                ) : (
                  <>
                    <form method="get" className="mb-5 flex flex-wrap items-end gap-3">
                      <div>
                        <label htmlFor="mes" className={labelCls}>
                          {t("admin.monthLabel")}
                        </label>
                        <select
                          id="mes"
                          name="mes"
                          defaultValue={mesElegido}
                          className={`${inputCls} sm:min-w-[220px]`}
                        >
                          <option value="">{t("admin.allMonths")}</option>
                          {meses.map((m) => (
                            <option key={m} value={m}>
                              {mesLabel(m)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button type="submit" className="btn-secondary">
                        {t("admin.filter")}
                      </button>
                    </form>
                    <MovimientosPorMes
                      movimientos={visibles}
                      proyectos={titulos}
                      mesLabel={mesLabel}
                      t={t}
                      fecha={fecha}
                      horas={horas}
                    />
                  </>
                )}
              </Panel>
            </div>
          ) : null}

          <div id="cobros" className="order-4 scroll-mt-4">
            <Panel
              title={t("finance.collections.title")}
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
        </div>

        <div className="contents lg:grid lg:content-start lg:gap-6">
          <div id="horas" className="order-1 scroll-mt-4">
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
                    {num(restantes)}
                    <span className="text-muted ml-1 text-sm font-normal">
                      {t("admin.availOf", { total: num(bolsa.horas_contratadas) })}
                    </span>
                  </p>
                  <div className="mt-3">
                    <ProgressBar
                      value={bolsa.horas_consumidas}
                      max={bolsa.horas_contratadas}
                      label={t("home.consumedHours")}
                    />
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-muted">{t("hoursPage.contracted")}</dt>
                      <dd className="font-semibold tabular-nums">
                        {horas(bolsa.horas_contratadas)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t("hoursPage.consumed")}</dt>
                      <dd className="font-semibold tabular-nums">
                        {horas(bolsa.horas_consumidas)}
                      </dd>
                    </div>
                    {bolsa.precio !== null ? (
                      <div className="col-span-2">
                        <dt className="text-muted">{t("hoursPage.price")}</dt>
                        <dd className="font-semibold tabular-nums">{euros(bolsa.precio)}</dd>
                      </div>
                    ) : null}
                  </dl>
                </>
              ) : (
                <EmptyState>{t("admin.noBank")}</EmptyState>
              )}
            </Panel>
          </div>

          <div id="personas" className="order-5 scroll-mt-4">
            <Panel title={t("admin.people")}>
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
          </div>

          <div id="datos" className="order-6 scroll-mt-4">
            <EmpresaDatos empresa={empresa} />
          </div>
        </div>
      </div>
    </>
  );
}
