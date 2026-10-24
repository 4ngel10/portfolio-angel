"use client";

import Link from "next/link";
import { SECTORES } from "@/lib/portal/sectores";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

const ESTADOS = [
  ["activo", "status.active"],
  ["pausado", "status.paused"],
  ["completado", "status.completed"],
] as const;

/** Filtros de la lista de proyectos: se aplican al elegir una opción, sin botón. */
export function FiltrosProyectos({ sector, estado }: { sector: string; estado: string }) {
  const { t } = usePT();
  return (
    <form
      method="get"
      role="search"
      aria-label={t("admin.filterAria")}
      className="mb-4 flex flex-wrap items-end gap-3"
      onChange={(e) => e.currentTarget.requestSubmit()}
    >
      <div>
        <label htmlFor="f-sector" className={labelCls}>
          {t("admin.filterSector")}
        </label>
        <select id="f-sector" name="sector" defaultValue={sector} className={`${inputCls} !w-auto`}>
          <option value="">{t("admin.filterAll")}</option>
          {SECTORES.map((s) => (
            <option key={s} value={s}>
              {t(`sectors.${s}`)}
            </option>
          ))}
          <option value="sin">{t("admin.sectorNone")}</option>
        </select>
      </div>
      <div>
        <label htmlFor="f-estado" className={labelCls}>
          {t("admin.filterStatus")}
        </label>
        <select id="f-estado" name="estado" defaultValue={estado} className={`${inputCls} !w-auto`}>
          <option value="">{t("admin.filterAll")}</option>
          {ESTADOS.map(([valor, clave]) => (
            <option key={valor} value={valor}>
              {t(clave)}
            </option>
          ))}
        </select>
      </div>
      {sector || estado ? (
        <Link
          href="/admin/proyectos"
          className="text-muted hover:text-ink py-2 text-sm underline underline-offset-4"
        >
          {t("admin.clearFilters")}
        </Link>
      ) : null}
      <noscript>
        <button type="submit" className="btn-secondary !px-4 !py-2 !text-sm">
          {t("admin.filter")}
        </button>
      </noscript>
    </form>
  );
}
