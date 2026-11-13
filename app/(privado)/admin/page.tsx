import Link from "next/link";
import type { Metadata } from "next";
import { getI18n } from "@/lib/portal/i18n";
import {
  cargarIncidencias,
  incidenciasSinRespuesta,
  listarBolsas,
  listarEmpresas,
  listarPresupuestos,
  listarProyectos,
  mapaTitulos,
} from "@/lib/portal/queries";
import { requireAdmin } from "@/lib/portal/auth";
import { borradoresDeApi } from "@/lib/blog-admin";
import { proyectosPendientes } from "@/lib/proyectos-admin";
import { cobrosConEstado, listarGastos, listarPagos } from "@/lib/portal/finanzas-queries";
import {
  diasEntre,
  diasLaborables,
  fechaMadrid,
  hoyMadrid,
  rangoPeriodo,
  resumenCaja,
} from "@/lib/portal/finanzas";
import { redondear } from "@/lib/portal/presupuestos";
import type { Prioridad } from "@/lib/portal/types";
import { ListaPendiente, type ItemPendiente } from "@/components/portal/pendiente";
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

const ORDEN_PRIORIDAD: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };
/** Un presupuesto enviado avisa de su caducidad cuando faltan estos días o menos. */
const AVISO_CADUCIDAD_DIAS = 7;
/** Una incidencia sin respuesta del admin entra en "Pendiente de ti" pasados estos días laborables. */
const ESPERA_INCIDENCIA_LABORABLES = 2;
/** "Aceptado sin proyecto" solo avisa de los aceptados en este plazo, para no llenar la lista con los antiguos. */
const AVISO_ACEPTADO_DIAS = 90;

export default async function AdminPage() {
  await requireAdmin();
  const { t, euros, num } = await getI18n();
  const hoy = hoyMadrid();
  const { desde, hasta } = rangoPeriodo("mes", hoy);

  const [
    empresas,
    todosProyectos,
    todasBolsas,
    { incidencias: todasIncidencias },
    cobros,
    todosPresupuestos,
    todasSinRespuesta,
    pagos,
    gastos,
    borradoresApi,
    portfolioPendiente,
  ] = await Promise.all([
    listarEmpresas(),
    listarProyectos(),
    listarBolsas(),
    cargarIncidencias({ soloAbiertas: true }),
    cobrosConEstado(),
    listarPresupuestos(),
    incidenciasSinRespuesta(),
    listarPagos(),
    listarGastos(),
    borradoresDeApi(),
    proyectosPendientes(),
  ]);

  // Los clientes archivados no salen en el Resumen ni en "Pendiente de ti". Sus cobros y pagos
  // pasados siguen contando en la línea "Este mes" y en Finanzas.
  const activas = new Set(empresas.map((e) => e.id));
  const proyectos = todosProyectos.filter((p) => activas.has(p.empresa_id));
  const bolsas = todasBolsas.filter((b) => activas.has(b.empresa_id));
  const incidencias = todasIncidencias.filter((i) => activas.has(i.empresa_id));
  const presupuestos = todosPresupuestos.filter((p) => activas.has(p.empresa_id));
  const sinRespuesta = todasSinRespuesta.filter((s) => activas.has(s.incidencia.empresa_id));

  // Pendiente de cobro: todo lo que sigue sin pagar y no está anulado, venza cuando venza.
  const abiertos = cobros.filter((c) => ["pendiente", "parcial", "vencido"].includes(c.estado));
  const pendienteCobro = redondear(abiertos.reduce((s, c) => s + c.pendiente, 0));
  const vencidos = abiertos
    .filter((c) => c.estado === "vencido" && activas.has(c.cobro.empresa_id))
    .map((c) => ({ ...c, dias: diasEntre(c.cobro.fecha_vencimiento!, hoy) }))
    .sort((a, b) => b.dias - a.dias);

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

  const hace = (n: number) =>
    n <= 0 ? t("admin.agoToday") : n === 1 ? t("admin.agoOne") : t("admin.agoMany", { n });
  const enDias = (n: number, uno: string, varios: string) => (n === 1 ? t(uno) : t(varios, { n }));

  /* ---------------- Pendiente de ti ---------------- */
  const pendiente: ItemPendiente[] = [];

  const enviados = presupuestos
    .filter((p) => p.estado === "enviado")
    .map((p) => ({
      p,
      // Días hasta que caduca; negativo = ya caducado. Primero los más urgentes y luego los más antiguos.
      caduca: p.valido_hasta ? diasEntre(hoy, p.valido_hasta) : null,
    }))
    .sort(
      (a, b) =>
        (a.caduca ?? Infinity) - (b.caduca ?? Infinity) ||
        a.p.fecha_emision.localeCompare(b.p.fecha_emision),
    );
  for (const { p, caduca } of enviados) {
    let aviso: string | undefined;
    if (caduca !== null && caduca <= AVISO_CADUCIDAD_DIAS) {
      aviso =
        caduca < 0
          ? t("admin.expiredAgo", { ago: hace(-caduca) })
          : caduca === 0
            ? t("admin.expiresToday")
            : caduca === 1
              ? t("admin.expiresTomorrow")
              : t("admin.expiresIn", { n: caduca });
    }
    pendiente.push({
      icono: "presupuesto",
      texto: t("admin.pendQuote", {
        numero: p.numero,
        empresa: nombreEmpresa[p.empresa_id] ?? "",
        ago: hace(diasEntre(p.fecha_emision, hoy)),
      }),
      aviso,
      href: `/admin/presupuestos/${p.id}`,
    });
  }

  // Aceptados sin proyecto. Se cuenta desde la firma y, si no hay, desde la emisión.
  const conProyecto = new Set(proyectos.map((p) => p.presupuesto_id).filter(Boolean));
  const sinProyecto = presupuestos
    .filter((p) => p.estado === "aceptado" && !conProyecto.has(p.id))
    .map((p) => ({ p, dias: diasEntre(fechaMadrid(p.firma_fecha ?? p.fecha_emision), hoy) }))
    .filter((x) => x.dias <= AVISO_ACEPTADO_DIAS)
    .sort((a, b) => b.dias - a.dias);
  for (const { p, dias } of sinProyecto) {
    pendiente.push({
      icono: "presupuesto",
      texto: t("admin.pendAccepted", {
        numero: p.numero,
        empresa: nombreEmpresa[p.empresa_id] ?? "",
      }),
      aviso: t("admin.acceptedAgo", { ago: hace(dias) }),
      href: `/admin/proyectos?empresa=${p.empresa_id}&presupuesto=${p.id}`,
    });
  }

  for (const v of vencidos) {
    pendiente.push({
      icono: "cobro",
      texto: t("admin.pendCharge", {
        numero: v.cobro.numero,
        empresa: nombreEmpresa[v.cobro.empresa_id] ?? "",
        importe: euros(v.pendiente),
      }),
      aviso: enDias(v.dias, "admin.lateOne", "admin.lateDays"),
      href: `/admin/finanzas/cobros/${v.cobro.id}`,
    });
  }

  const esperando = sinRespuesta
    .map((s) => ({ ...s, dias: diasLaborables(fechaMadrid(s.desde), hoy) }))
    .filter((s) => s.dias > ESPERA_INCIDENCIA_LABORABLES)
    .sort((a, b) => b.dias - a.dias);
  for (const { incidencia: i, dias } of esperando) {
    pendiente.push({
      icono: "incidencia",
      texto: t("admin.pendIncident", {
        titulo: i.titulo,
        empresa: nombreEmpresa[i.empresa_id] ?? "",
      }),
      aviso: enDias(dias, "admin.waitingOne", "admin.waitingDays"),
      href: `/admin/proyectos/${i.proyecto_id}`,
    });
  }

  for (const b of bajas) {
    pendiente.push({
      icono: "bolsa",
      texto: t("admin.pendBank", { empresa: nombreEmpresa[b.empresa_id] ?? "" }),
      aviso: t("admin.leftOf", {
        left: num(Math.max(0, Math.round((b.horas_contratadas - b.horas_consumidas) * 100) / 100)),
        total: num(b.horas_contratadas),
      }),
      href: `/admin/clientes/${b.empresa_id}`,
    });
  }

  // Borradores que ha creado la API del blog y esperan que los revises.
  for (const b of borradoresApi) {
    pendiente.push({
      icono: "articulo",
      texto: t("blog.pendingApi", { title: b.content.es.title || t("blog.untitled") }),
      href: `/admin/blog/${b.id}`,
    });
  }

  // Proyectos del portfolio: borradores sin publicar y publicados con cifras sin validar.
  for (const b of portfolioPendiente.borradores) {
    pendiente.push({
      icono: "articulo",
      texto: t("portfolio.pendingDraft", { title: b.content.es.title || t("portfolio.untitled") }),
      href: `/admin/portfolio/${b.id}`,
    });
  }
  for (const b of portfolioPendiente.provisionales) {
    pendiente.push({
      icono: "articulo",
      texto: t("portfolio.pendingProvisional", { title: b.content.es.title || t("portfolio.untitled") }),
      href: `/admin/portfolio/${b.id}`,
    });
  }

  // Mes en curso: el mismo cálculo que la pestaña General de Finanzas.
  const mes = resumenCaja(pagos, gastos, desde, hasta);

  // Incidencias abiertas: primero la prioridad y, a igual prioridad, las más antiguas.
  const ordenadas = [...incidencias].sort(
    (a, b) =>
      ORDEN_PRIORIDAD[a.prioridad] - ORDEN_PRIORIDAD[b.prioridad] ||
      a.created_at.localeCompare(b.created_at),
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
  const tile =
    "border-rule bg-paper-alt flex items-baseline gap-2.5 rounded-xl border px-4 py-2.5 transition-[color,border-color,background-color,opacity,transform] duration-150 ease-[var(--ease-out)] hover:border-[var(--fg)] active:scale-[0.98]";
  const numCls = "text-2xl leading-none font-semibold tracking-tight tabular-nums";

  return (
    <>
      <PageHeader title={t("admin.overview")} />
      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {cifras.map((c) => (
          <Link key={c.l} href={c.href} className={tile}>
            <dd className={numCls}>{c.n}</dd>
            <dt className="text-muted text-sm leading-snug">{c.l}</dt>
          </Link>
        ))}
        <Link
          href="/admin/finanzas/cobros?estado=pendiente"
          className={`${tile} col-span-2 flex-wrap lg:col-span-1`}
        >
          <dd className={numCls}>{euros(pendienteCobro)}</dd>
          <dt className="text-muted text-sm leading-snug">{t("admin.statPendingCollect")}</dt>
        </Link>
      </dl>

      <Panel title={t("admin.pendingTitle")} className="mb-6">
        {pendiente.length === 0 ? (
          <EmptyState>{t("admin.allCaughtUp")}</EmptyState>
        ) : (
          <ListaPendiente items={pendiente} />
        )}
      </Panel>

      <Link
        href="/admin/finanzas"
        className="border-rule bg-paper-alt mb-6 flex flex-wrap items-baseline gap-x-8 gap-y-2 rounded-2xl border px-5 py-3.5 transition-[border-color] duration-150 hover:border-[var(--fg)]"
      >
        <span className="text-sm font-semibold">{t("admin.thisMonth")}</span>
        {[
          { l: t("admin.monthCollected"), v: mes.cobrado, cls: "" },
          { l: t("admin.monthExpenses"), v: mes.gastado, cls: "" },
          {
            l: t("admin.monthResult"),
            v: mes.resultado,
            cls:
              mes.resultado < 0
                ? "text-[var(--accent)]"
                : mes.resultado > 0
                  ? "text-[var(--positive)]"
                  : "",
          },
        ].map((x) => (
          <span key={x.l} className="text-sm">
            <span className="text-muted">{x.l} </span>
            <span className={`font-semibold tabular-nums ${x.cls}`}>{euros(x.v)}</span>
          </span>
        ))}
        <span className="text-muted ml-auto text-sm underline underline-offset-4">
          {t("admin.viewFinance")}
        </span>
      </Link>

      <div id="incidencias" className="scroll-mt-4">
        <Panel
          title={t("admin.openIncidents")}
          action={
            <Link
              href="/admin/incidencias"
              className="hover:text-accent text-sm underline underline-offset-4"
            >
              {t("admin.seeAllIncidents")}
            </Link>
          }
        >
          {ordenadas.length === 0 ? (
            <EmptyState>{t("admin.noOpen")}</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--rule)]">
              {ordenadas.map((i) => (
                <li key={i.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/admin/proyectos/${i.proyecto_id}`}
                    className="hover:text-accent font-medium underline-offset-4 hover:underline"
                  >
                    {i.titulo}
                  </Link>
                  <p className="text-muted mt-0.5 text-xs">
                    {nombreEmpresa[i.empresa_id]} · {titulos[i.proyecto_id]} ·{" "}
                    {hace(diasEntre(fechaMadrid(i.created_at), hoy))}
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
    </>
  );
}
