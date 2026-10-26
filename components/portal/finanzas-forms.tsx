"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  generarCobroBolsa,
  generarCobrosPresupuesto,
  guardarAjustes,
  guardarCobro,
  guardarGasto,
  guardarSuscripcion,
  registrarPago,
} from "@/lib/portal/finanzas-actions";
import {
  CATEGORIAS_GASTO,
  METODOS_PAGO,
  PERIODICIDADES,
  PLANES_COBRO,
  repartir,
} from "@/lib/portal/finanzas";
import type { Cobro, Gasto, Suscripcion } from "@/lib/portal/types";
import { ActionForm } from "./action-form";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

/** Importe como se escribe en un campo: coma decimal, sin separador de miles. */
const aCampo = (n: number | null | undefined) =>
  n === null || n === undefined ? "" : String(n).replace(".", ",");

function Campo({
  id,
  label,
  hint,
  className = "",
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      {children}
      {hint ? (
        <p id={`${id}-hint`} className="text-muted mt-1.5 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type Opcion = { id: string; nombre: string };

function SelectMetodo({ id, name, valor }: { id: string; name: string; valor?: string | null }) {
  const { t } = usePT();
  return (
    <select id={id} name={name} defaultValue={valor ?? ""} className={inputCls}>
      <option value="">{t("finance.form.noMethod")}</option>
      {METODOS_PAGO.map((m) => (
        <option key={m} value={m}>
          {t(`finance.method.${m}`)}
        </option>
      ))}
    </select>
  );
}

function SelectCategoria({ id, valor }: { id: string; valor: string }) {
  const { t } = usePT();
  return (
    <select id={id} name="categoria" required defaultValue={valor} className={inputCls}>
      {CATEGORIAS_GASTO.map((c) => (
        <option key={c} value={c}>
          {t(`finance.category.${c}`)}
        </option>
      ))}
    </select>
  );
}

/** Alta y edición de un cobro. El proyecto solo ofrece los del cliente elegido. */
export function FormCobro({
  empresas,
  proyectos,
  hoy,
  inicial,
  empresaInicial,
}: {
  empresas: Opcion[];
  proyectos: (Opcion & { empresa_id: string })[];
  hoy: string;
  inicial?: Cobro;
  empresaInicial?: string;
}) {
  const { t } = usePT();
  const [empresa, setEmpresa] = useState(inicial?.empresa_id ?? empresaInicial ?? "");
  const delCliente = proyectos.filter((p) => p.empresa_id === empresa);

  return (
    <ActionForm
      action={guardarCobro}
      submitLabel={inicial ? t("common.saveChanges") : t("finance.collections.create")}
      messageTimeout={4000}
    >
      {inicial ? <input type="hidden" name="id" value={inicial.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="cb-empresa" label={t("common.company")}>
          <select
            id="cb-empresa"
            name="empresa_id"
            required
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            className={inputCls}
          >
            <option value="" disabled>
              {t("common.chooseCompany")}
            </option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="cb-proyecto" label={t("finance.form.project")}>
          {/* key: al cambiar de cliente se vacía la selección del proyecto. */}
          <select
            key={empresa}
            id="cb-proyecto"
            name="proyecto_id"
            defaultValue={inicial?.empresa_id === empresa ? (inicial?.proyecto_id ?? "") : ""}
            className={inputCls}
          >
            <option value="">{t("finance.form.noProject")}</option>
            {delCliente.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="cb-concepto" label={t("finance.form.concept")} className="sm:col-span-2">
          <input
            id="cb-concepto"
            name="concepto"
            required
            minLength={3}
            maxLength={200}
            defaultValue={inicial?.concepto ?? ""}
            className={inputCls}
          />
        </Campo>
        <Campo id="cb-importe" label={t("finance.form.amount")} hint={t("finance.form.amountHint")}>
          <input
            id="cb-importe"
            name="importe"
            required
            inputMode="decimal"
            autoComplete="off"
            defaultValue={aCampo(inicial?.importe)}
            className={`${inputCls} tabular-nums`}
          />
        </Campo>
        <div className="grid grid-cols-2 gap-4">
          <Campo id="cb-emision" label={t("finance.form.issueDate")}>
            <input
              id="cb-emision"
              type="date"
              name="fecha_emision"
              required
              defaultValue={inicial?.fecha_emision ?? hoy}
              className={inputCls}
            />
          </Campo>
          <Campo id="cb-vence" label={t("finance.form.dueDate")}>
            <input
              id="cb-vence"
              type="date"
              name="fecha_vencimiento"
              defaultValue={inicial?.fecha_vencimiento ?? ""}
              className={inputCls}
            />
          </Campo>
        </div>
        <Campo id="cb-notas" label={t("finance.form.notes")} className="sm:col-span-2">
          <textarea
            id="cb-notas"
            name="notas"
            rows={2}
            maxLength={3000}
            defaultValue={inicial?.notas ?? ""}
            className={inputCls}
          />
        </Campo>
      </div>
    </ActionForm>
  );
}

/** Registrar un pago. El importe viene con lo que queda pendiente. */
export function FormPago({
  cobroId,
  pendiente,
  hoy,
}: {
  cobroId: string;
  pendiente: number;
  hoy: string;
}) {
  const { t } = usePT();
  return (
    <ActionForm
      action={registrarPago}
      submitLabel={t("finance.payment.register")}
      messageTimeout={4000}
    >
      <input type="hidden" name="cobro_id" value={cobroId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="pg-importe" label={t("finance.form.amount")} hint={t("finance.form.amountHint")}>
          <input
            id="pg-importe"
            name="importe"
            required
            inputMode="decimal"
            autoComplete="off"
            defaultValue={aCampo(pendiente)}
            className={`${inputCls} tabular-nums`}
          />
        </Campo>
        <Campo id="pg-fecha" label={t("finance.form.date")}>
          <input
            id="pg-fecha"
            type="date"
            name="fecha"
            required
            defaultValue={hoy}
            className={inputCls}
          />
        </Campo>
        <Campo id="pg-metodo" label={t("finance.form.method")}>
          <select id="pg-metodo" name="metodo" defaultValue="transferencia" className={inputCls}>
            {METODOS_PAGO.map((m) => (
              <option key={m} value={m}>
                {t(`finance.method.${m}`)}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="pg-ref" label={t("finance.form.reference")}>
          <input id="pg-ref" name="referencia" maxLength={120} className={inputCls} />
        </Campo>
      </div>
    </ActionForm>
  );
}

/** Los campos fiscales solo aparecen cuando el negocio los tiene activados. */
export function FormGasto({
  proyectos,
  empresas,
  hoy,
  fiscal,
  inicial,
}: {
  proyectos: Opcion[];
  empresas: Opcion[];
  hoy: string;
  fiscal: boolean;
  inicial?: Gasto;
}) {
  const { t } = usePT();
  return (
    <ActionForm
      action={guardarGasto}
      submitLabel={inicial ? t("common.saveChanges") : t("finance.expenses.create")}
      messageTimeout={4000}
    >
      {inicial ? <input type="hidden" name="id" value={inicial.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="gs-concepto" label={t("finance.form.concept")} className="sm:col-span-2">
          <input
            id="gs-concepto"
            name="concepto"
            required
            minLength={2}
            maxLength={200}
            defaultValue={inicial?.concepto ?? ""}
            className={inputCls}
          />
        </Campo>
        <Campo
          id="gs-importe"
          label={t("finance.form.amountPaid")}
          hint={t("finance.form.amountHint")}
        >
          <input
            id="gs-importe"
            name="importe"
            required
            inputMode="decimal"
            autoComplete="off"
            defaultValue={aCampo(inicial?.importe)}
            className={`${inputCls} tabular-nums`}
          />
        </Campo>
        <Campo id="gs-fecha" label={t("finance.form.date")}>
          <input
            id="gs-fecha"
            type="date"
            name="fecha"
            required
            defaultValue={inicial?.fecha ?? hoy}
            className={inputCls}
          />
        </Campo>
        <Campo id="gs-proveedor" label={t("finance.form.provider")}>
          <input
            id="gs-proveedor"
            name="proveedor"
            maxLength={120}
            defaultValue={inicial?.proveedor ?? ""}
            className={inputCls}
          />
        </Campo>
        <Campo id="gs-categoria" label={t("finance.form.category")}>
          <SelectCategoria id="gs-categoria" valor={inicial?.categoria ?? "otros"} />
        </Campo>
        <Campo id="gs-metodo" label={t("finance.form.paymentMethod")}>
          <SelectMetodo id="gs-metodo" name="metodo_pago" valor={inicial?.metodo_pago} />
        </Campo>
        <Campo id="gs-proyecto" label={t("finance.form.attributeProject")}>
          <select
            id="gs-proyecto"
            name="proyecto_id"
            defaultValue={inicial?.proyecto_id ?? ""}
            className={inputCls}
          >
            <option value="">{t("finance.form.noProject")}</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="gs-empresa" label={t("finance.form.attributeClient")}>
          <select
            id="gs-empresa"
            name="empresa_id"
            defaultValue={inicial?.empresa_id ?? ""}
            className={inputCls}
          >
            <option value="">{t("finance.form.noClient")}</option>
            {empresas.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </Campo>
        {fiscal ? (
          <>
            <Campo id="gs-iva" label={t("finance.form.vatPct")}>
              <input
                id="gs-iva"
                name="iva_pct"
                inputMode="decimal"
                defaultValue={aCampo(inicial?.iva_pct)}
                className={`${inputCls} tabular-nums`}
              />
            </Campo>
            <label className="flex items-center gap-2 self-end pb-3 text-sm">
              <input
                type="checkbox"
                name="deducible"
                defaultChecked={inicial?.deducible ?? false}
                className="size-4 accent-[var(--accent)]"
              />
              {t("finance.form.deductible")}
            </label>
          </>
        ) : null}
        <Campo id="gs-notas" label={t("finance.form.notes")} className="sm:col-span-2">
          <textarea
            id="gs-notas"
            name="notas"
            rows={2}
            maxLength={3000}
            defaultValue={inicial?.notas ?? ""}
            className={inputCls}
          />
        </Campo>
      </div>
    </ActionForm>
  );
}

export function FormSuscripcion({
  hoy,
  fiscal,
  inicial,
}: {
  hoy: string;
  fiscal: boolean;
  inicial?: Suscripcion;
}) {
  const { t } = usePT();
  return (
    <ActionForm
      action={guardarSuscripcion}
      submitLabel={inicial ? t("common.saveChanges") : t("finance.subscriptions.create")}
      messageTimeout={4000}
    >
      {inicial ? <input type="hidden" name="id" value={inicial.id} /> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo id="sb-nombre" label={t("finance.form.name")}>
          <input
            id="sb-nombre"
            name="nombre"
            required
            minLength={2}
            maxLength={120}
            defaultValue={inicial?.nombre ?? ""}
            className={inputCls}
          />
        </Campo>
        <Campo id="sb-proveedor" label={t("finance.form.provider")}>
          <input
            id="sb-proveedor"
            name="proveedor"
            maxLength={120}
            defaultValue={inicial?.proveedor ?? ""}
            className={inputCls}
          />
        </Campo>
        <Campo
          id="sb-importe"
          label={t("finance.form.amountCharged")}
          hint={t("finance.form.amountHint")}
        >
          <input
            id="sb-importe"
            name="importe"
            required
            inputMode="decimal"
            autoComplete="off"
            defaultValue={aCampo(inicial?.importe)}
            className={`${inputCls} tabular-nums`}
          />
        </Campo>
        <Campo id="sb-periodicidad" label={t("finance.form.period")}>
          <select
            id="sb-periodicidad"
            name="periodicidad"
            defaultValue={inicial?.periodicidad ?? "mensual"}
            className={inputCls}
          >
            {PERIODICIDADES.map((p) => (
              <option key={p} value={p}>
                {t(`finance.period.${p}`)}
              </option>
            ))}
          </select>
        </Campo>
        <Campo id="sb-renovacion" label={t("finance.form.nextRenewal")}>
          <input
            id="sb-renovacion"
            type="date"
            name="proxima_renovacion"
            required
            defaultValue={inicial?.proxima_renovacion ?? hoy}
            className={inputCls}
          />
        </Campo>
        <Campo id="sb-categoria" label={t("finance.form.category")}>
          <SelectCategoria id="sb-categoria" valor={inicial?.categoria ?? "software"} />
        </Campo>
        <Campo id="sb-metodo" label={t("finance.form.paymentMethod")}>
          <SelectMetodo id="sb-metodo" name="metodo_pago" valor={inicial?.metodo_pago} />
        </Campo>
        <Campo
          id="sb-aviso"
          label={t("finance.form.noticeDays")}
          hint={t("finance.form.noticeHint")}
        >
          <input
            id="sb-aviso"
            name="aviso_dias"
            type="number"
            min={0}
            max={60}
            defaultValue={inicial?.aviso_dias ?? 7}
            className={`${inputCls} tabular-nums`}
          />
        </Campo>
        <Campo id="sb-url" label={t("finance.form.billingUrl")} className="sm:col-span-2">
          <input
            id="sb-url"
            name="url_gestion"
            type="url"
            maxLength={300}
            placeholder="https://"
            defaultValue={inicial?.url_gestion ?? ""}
            className={inputCls}
          />
        </Campo>
        {fiscal ? (
          <Campo id="sb-iva" label={t("finance.form.vatPct")}>
            <input
              id="sb-iva"
              name="iva_pct"
              inputMode="decimal"
              defaultValue={aCampo(inicial?.iva_pct)}
              className={`${inputCls} tabular-nums`}
            />
          </Campo>
        ) : null}
        <Campo id="sb-notas" label={t("finance.form.notes")} className="sm:col-span-2">
          <textarea
            id="sb-notas"
            name="notas"
            rows={2}
            maxLength={3000}
            defaultValue={inicial?.notas ?? ""}
            className={inputCls}
          />
        </Campo>
      </div>
    </ActionForm>
  );
}

export function FormAjustes({
  fiscal,
  nombreComercial,
}: {
  fiscal: boolean;
  nombreComercial: string;
}) {
  const { t } = usePT();
  return (
    <ActionForm action={guardarAjustes} submitLabel={t("common.saveChanges")} messageTimeout={4000}>
      <div className="grid gap-5">
        <Campo id="aj-nombre" label={t("finance.settings.tradeName")}>
          <input
            id="aj-nombre"
            name="nombre_comercial"
            maxLength={120}
            defaultValue={nombreComercial}
            className={inputCls}
          />
        </Campo>
        <div>
          <label className="flex items-start gap-3 text-sm font-medium">
            <input
              type="checkbox"
              name="config_fiscal"
              defaultChecked={fiscal}
              aria-describedby="aj-fiscal-hint"
              className="mt-0.5 size-4 accent-[var(--accent)]"
            />
            {t("finance.settings.fiscal")}
          </label>
          <p id="aj-fiscal-hint" className="text-muted mt-1.5 ml-7 max-w-[60ch] text-sm">
            {t("finance.settings.fiscalHint")}
          </p>
        </div>
      </div>
    </ActionForm>
  );
}

const PLANES = [
  { clave: "completo", porcentajes: PLANES_COBRO.completo },
  { clave: "mitad", porcentajes: PLANES_COBRO.mitad },
  { clave: "tercios", porcentajes: PLANES_COBRO.tercios },
] as const;

/** Plan de cobros de un presupuesto aceptado, con los plazos calculados antes de crear nada. */
export function PlanCobros({ presupuestoId, total }: { presupuestoId: string; total: number }) {
  const { t, locale } = usePT();
  const [plan, setPlan] = useState<string>("mitad");
  const [custom, setCustom] = useState("50/30/20");

  const euros = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }),
    [locale],
  );

  const plazos = useMemo(() => {
    const fijo = PLANES.find((p) => p.clave === plan);
    const porcentajes = fijo
      ? [...fijo.porcentajes]
      : custom
          .split(/[/;\s]+/)
          .filter(Boolean)
          .map((p) => Number(p.replace(",", ".")));
    const validos =
      porcentajes.length > 0 &&
      porcentajes.length <= 12 &&
      porcentajes.every((p) => Number.isFinite(p) && p > 0) &&
      Math.abs(porcentajes.reduce((s, p) => s + p, 0) - 100) < 0.001;
    if (!validos) return null;
    const importes = repartir(total, porcentajes);
    return porcentajes.map((p, i) => ({ pct: p, importe: importes[i] }));
  }, [plan, custom, total]);

  return (
    <ActionForm
      action={generarCobrosPresupuesto}
      submitLabel={t("finance.plan.generate")}
      pendingLabel={t("finance.plan.generating")}
    >
      <input type="hidden" name="presupuesto_id" value={presupuestoId} />
      <input type="hidden" name="plan" value={plan} />
      <input type="hidden" name="porcentajes" value={custom} />

      <fieldset>
        <legend className={labelCls}>{t("finance.plan.title")}</legend>
        <div className="flex flex-wrap gap-2">
          {[...PLANES.map((p) => p.clave), "custom"].map((clave) => (
            <label
              key={clave}
              className={`cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--accent)] ${
                plan === clave
                  ? "bg-chip text-ink border-[var(--fg)]"
                  : "border-rule text-muted hover:text-ink"
              }`}
            >
              <input
                type="radio"
                name="plan-opcion"
                value={clave}
                checked={plan === clave}
                onChange={() => setPlan(clave)}
                className="sr-only"
              />
              {t(`finance.plan.${clave}`)}
            </label>
          ))}
        </div>
      </fieldset>

      {plan === "custom" ? (
        <Campo
          id="plan-custom"
          label={t("finance.plan.customLabel")}
          hint={t("finance.plan.customHint")}
          className="mt-4 max-w-xs"
        >
          <input
            id="plan-custom"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            inputMode="decimal"
            autoComplete="off"
            aria-describedby="plan-custom-hint"
            className={`${inputCls} tabular-nums`}
          />
        </Campo>
      ) : null}

      <div aria-live="polite" className="mt-4">
        {plazos ? (
          <ol className="divide-y divide-[var(--rule)] text-sm">
            {plazos.map((p, i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-2">
                <span className="text-muted">
                  {t("finance.plan.installment", { n: i + 1, count: plazos.length })} ·{" "}
                  {p.pct.toLocaleString(locale)} %
                </span>
                <span className="font-medium tabular-nums">{euros.format(p.importe)}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-[var(--accent)]">{t("err.planPercent")}</p>
        )}
      </div>
    </ActionForm>
  );
}

/** Botón de la bolsa de horas: crea el cobro con el precio de la bolsa. */
export function BotonCobroBolsa({ bolsaId }: { bolsaId: string }) {
  const { t } = usePT();
  return (
    <ActionForm
      action={generarCobroBolsa}
      submitLabel={t("finance.bank.createCollection")}
      pendingLabel={t("finance.plan.generating")}
      secondary
      className="[&>div]:mt-0"
    >
      <input type="hidden" name="bolsa_id" value={bolsaId} />
    </ActionForm>
  );
}
