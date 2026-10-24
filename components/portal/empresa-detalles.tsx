"use client";

import { guardarDetallesEmpresa } from "@/lib/portal/actions";
import { SECTORES } from "@/lib/portal/sectores";
import type { Empresa } from "@/lib/portal/types";
import type { FormState } from "@/lib/portal/validate";
import { ActionForm } from "./action-form";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

/** Datos básicos de una empresa: a qué se dedica, dónde está y cómo contactarla. */
export function EmpresaDetalles({
  empresa,
  onSuccess,
}: {
  empresa: Pick<Empresa, "id" | "sector" | "actividad" | "ubicacion" | "telefono" | "web">;
  onSuccess?: (state: FormState) => void;
}) {
  const { t } = usePT();
  const id = `emp-${empresa.id}`;
  return (
    <ActionForm
      action={guardarDetallesEmpresa}
      submitLabel={t("admin.saveDetails")}
      pendingLabel={t("admin.saving")}
      messageTimeout={2000}
      onSuccess={onSuccess}
    >
      <input type="hidden" name="id" value={empresa.id} />
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label htmlFor={`${id}-sector`} className={labelCls}>
            {t("admin.sector")}
          </label>
          <select
            id={`${id}-sector`}
            name="sector"
            defaultValue={empresa.sector ?? ""}
            className={inputCls}
          >
            <option value="">{t("admin.sectorNone")}</option>
            {SECTORES.map((s) => (
              <option key={s} value={s}>
                {t(`sectors.${s}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-ubicacion`} className={labelCls}>
            {t("admin.location")}
          </label>
          <input
            id={`${id}-ubicacion`}
            name="ubicacion"
            maxLength={120}
            defaultValue={empresa.ubicacion ?? ""}
            placeholder={t("admin.locationPlaceholder")}
            autoComplete="off"
            className={inputCls}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor={`${id}-actividad`} className={labelCls}>
            {t("admin.activity")}
          </label>
          <textarea
            id={`${id}-actividad`}
            name="actividad"
            rows={2}
            maxLength={300}
            defaultValue={empresa.actividad ?? ""}
            placeholder={t("admin.activityPlaceholder")}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={`${id}-telefono`} className={labelCls}>
            {t("admin.phone")}
          </label>
          <input
            id={`${id}-telefono`}
            name="telefono"
            type="tel"
            maxLength={30}
            defaultValue={empresa.telefono ?? ""}
            autoComplete="off"
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor={`${id}-web`} className={labelCls}>
            {t("admin.website")}
          </label>
          <input
            id={`${id}-web`}
            name="web"
            type="url"
            maxLength={200}
            defaultValue={empresa.web ?? ""}
            placeholder="https://"
            autoComplete="off"
            spellCheck={false}
            className={inputCls}
          />
        </div>
      </div>
    </ActionForm>
  );
}
