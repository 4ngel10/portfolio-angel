import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { cargarIncidencias, listarEmpresas, listarProyectos } from "@/lib/portal/queries";
import { isUuid, oneOf } from "@/lib/portal/validate";
import type { Prioridad } from "@/lib/portal/types";
import { IncidenciasLista } from "@/components/portal/listas";
import { inputCls, labelCls } from "@/components/portal/styles";
import { PageHeader, Panel } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("nav.incidents") };
}

const ESTADOS = ["abierta", "en_progreso", "resuelta"] as const;
const PRIORIDADES = ["alta", "media", "baja"] as const;
const ORDEN: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

/** Todas las incidencias con filtros por estado, prioridad y empresa (formulario GET, sin JS). */
export default async function IncidenciasAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; prioridad?: string; empresa?: string }>;
}) {
  const perfil = await requireAdmin();
  const { t } = await getI18n();
  const q = await searchParams;
  const estado = oneOf(q.estado, ESTADOS);
  const prioridad = oneOf(q.prioridad, PRIORIDADES);

  const [{ incidencias, mensajes, autores }, empresas, proyectos] = await Promise.all([
    cargarIncidencias(),
    listarEmpresas(),
    listarProyectos(),
  ]);
  const empresa = isUuid(q.empresa) && empresas.some((e) => e.id === q.empresa) ? q.empresa : "";
  const titulos = Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]));

  // Las abiertas primero, luego las demás; dentro de cada grupo, por prioridad y antigüedad.
  const filtradas = incidencias
    .filter(
      (i) =>
        (!estado || i.estado === estado) &&
        (!prioridad || i.prioridad === prioridad) &&
        (!empresa || i.empresa_id === empresa),
    )
    .sort(
      (a, b) =>
        Number(a.estado === "resuelta") - Number(b.estado === "resuelta") ||
        ORDEN[a.prioridad] - ORDEN[b.prioridad] ||
        a.created_at.localeCompare(b.created_at),
    );
  const filtrado = !!estado || !!prioridad || !!empresa;

  return (
    <>
      <PageHeader title={t("nav.incidents")} intro={t("admin.incidentsIntro")} />
      <Panel>
        <form
          method="get"
          role="search"
          aria-label={t("admin.incidentsFilterAria")}
          className="mb-5 flex flex-wrap items-end gap-3"
        >
          <div>
            <label htmlFor="i-estado" className={labelCls}>
              {t("admin.colStatus")}
            </label>
            <select
              id="i-estado"
              name="estado"
              defaultValue={estado ?? ""}
              className={`${inputCls} !w-auto`}
            >
              <option value="">{t("admin.filterAll")}</option>
              <option value="abierta">{t("status.open")}</option>
              <option value="en_progreso">{t("status.inProgress")}</option>
              <option value="resuelta">{t("status.resolved")}</option>
            </select>
          </div>
          <div>
            <label htmlFor="i-prioridad" className={labelCls}>
              {t("admin.filterPriority")}
            </label>
            <select
              id="i-prioridad"
              name="prioridad"
              defaultValue={prioridad ?? ""}
              className={`${inputCls} !w-auto`}
            >
              <option value="">{t("admin.filterAll")}</option>
              <option value="alta">{t("status.high")}</option>
              <option value="media">{t("status.medium")}</option>
              <option value="baja">{t("status.low")}</option>
            </select>
          </div>
          <div>
            <label htmlFor="i-empresa" className={labelCls}>
              {t("common.company")}
            </label>
            <select
              id="i-empresa"
              name="empresa"
              defaultValue={empresa}
              className={`${inputCls} !w-auto`}
            >
              <option value="">{t("admin.filterAll")}</option>
              {empresas.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.nombre}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-secondary !px-4 !py-2.5 !text-sm">
            {t("admin.filter")}
          </button>
          {filtrado ? (
            <Link
              href="/admin/incidencias"
              className="text-muted hover:text-ink pb-2.5 text-sm underline underline-offset-4"
            >
              {t("admin.clearFilters")}
            </Link>
          ) : null}
        </form>

        <p role="status" className="text-muted mb-3 text-sm">
          {t("admin.incidentsCount", { shown: filtradas.length, total: incidencias.length })}
        </p>
        <IncidenciasLista
          incidencias={filtradas}
          mensajes={mensajes}
          autores={autores}
          proyectos={titulos}
          perfilId={perfil.id}
          admin
          rutaProyecto="/admin/proyectos"
        />
      </Panel>
    </>
  );
}
