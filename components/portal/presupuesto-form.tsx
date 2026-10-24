"use client";

import { useRef, useState } from "react";
import { guardarPresupuesto } from "@/lib/portal/actions";
import { PLANTILLAS, TIPOS_IVA, totales } from "@/lib/portal/presupuestos";
import { ActionForm } from "./action-form";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

type Linea = { key: number; concepto: string; detalle: string; cantidad: string; precio: string };

export type PresupuestoInicial = {
  id: string;
  empresa_id: string;
  titulo: string;
  fecha_emision: string;
  valido_hasta: string | null;
  iva: number;
  descuento: number;
  notas: string | null;
  lineas: { concepto: string; detalle: string | null; cantidad: number; precio_unitario: number }[];
};

const sumarDias = (iso: string, dias: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
};

const num = (v: string) => {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/** Editor de presupuestos: datos generales, líneas con totales en vivo y plantillas de partida. */
export function PresupuestoForm({
  empresas,
  hoy,
  inicial,
}: {
  empresas: { id: string; nombre: string }[];
  hoy: string;
  inicial?: PresupuestoInicial;
}) {
  const { t, locale } = usePT();
  const siguiente = useRef(0);
  const nuevaLinea = (parcial: Partial<Linea> = {}): Linea => ({
    key: siguiente.current++,
    concepto: "",
    detalle: "",
    cantidad: "1",
    precio: "",
    ...parcial,
  });

  const [lineas, setLineas] = useState<Linea[]>(() =>
    inicial?.lineas.length
      ? inicial.lineas.map((l) =>
          nuevaLinea({
            concepto: l.concepto,
            detalle: l.detalle ?? "",
            cantidad: String(l.cantidad),
            precio: String(l.precio_unitario),
          }),
        )
      : [nuevaLinea()],
  );
  const [iva, setIva] = useState(String(inicial?.iva ?? 21));
  const [descuento, setDescuento] = useState(String(inicial?.descuento ?? 0));
  const [emision, setEmision] = useState(inicial?.fecha_emision ?? hoy);
  const [validez, setValidez] = useState(
    inicial ? (inicial.valido_hasta ?? "") : sumarDias(hoy, 30),
  );

  const euros = (n: number) =>
    n.toLocaleString(locale === "es" ? "es-ES" : "en-GB", { style: "currency", currency: "EUR" });
  const calculo = totales(
    lineas.map((l) => ({ cantidad: num(l.cantidad), precio_unitario: num(l.precio) })),
    num(descuento),
    num(iva),
  );

  const cambiar = (key: number, campo: keyof Linea, valor: string) =>
    setLineas((ls) => ls.map((l) => (l.key === key ? { ...l, [campo]: valor } : l)));

  const anadirPlantilla = (clave: string) => {
    const p = PLANTILLAS.find((x) => x.clave === clave);
    if (!p) return;
    const nueva = nuevaLinea({
      concepto: t(`quotes.templates.${p.clave}.name`),
      detalle: t(`quotes.templates.${p.clave}.detail`),
    });
    // Si solo hay una línea vacía se reutiliza en vez de dejarla suelta.
    setLineas((ls) =>
      ls.length === 1 && !ls[0].concepto && !ls[0].precio ? [nueva] : [...ls, nueva],
    );
  };

  const json = JSON.stringify(
    lineas.map((l) => ({
      concepto: l.concepto,
      detalle: l.detalle,
      cantidad: num(l.cantidad),
      precio_unitario: num(l.precio),
    })),
  );

  return (
    <ActionForm
      action={guardarPresupuesto}
      submitLabel={inicial ? t("quotes.saveChanges") : t("quotes.create")}
      pendingLabel={t("admin.saving")}
      messageTimeout={4000}
    >
      {inicial ? <input type="hidden" name="id" value={inicial.id} /> : null}
      <input type="hidden" name="lineas" value={json} />

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="q-empresa" className={labelCls}>
            {t("common.company")}
          </label>
          <select
            id="q-empresa"
            name="empresa_id"
            required
            defaultValue={inicial?.empresa_id ?? ""}
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
        </div>
        <div>
          <label htmlFor="q-titulo" className={labelCls}>
            {t("quotes.titleLabel")}
          </label>
          <input
            id="q-titulo"
            name="titulo"
            required
            minLength={3}
            maxLength={140}
            defaultValue={inicial?.titulo}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="q-emision" className={labelCls}>
            {t("quotes.issueDate")}
          </label>
          <input
            id="q-emision"
            name="fecha_emision"
            type="date"
            required
            value={emision}
            onChange={(e) => setEmision(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label htmlFor="q-validez" className={labelCls}>
            {t("quotes.validUntil")}
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="q-validez"
              name="valido_hasta"
              type="date"
              value={validez}
              onChange={(e) => setValidez(e.target.value)}
              className={`${inputCls} sm:max-w-[200px]`}
            />
            {[15, 30, 60].map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setValidez(sumarDias(emision || hoy, d))}
                className="btn-secondary !px-3 !py-1.5 !text-xs"
              >
                {t("quotes.days", { n: d })}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-semibold tracking-tight">{t("quotes.linesTitle")}</h3>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted">{t("quotes.addFromTemplate")}</span>
            <select
              value=""
              onChange={(e) => anadirPlantilla(e.target.value)}
              className={`${inputCls} !w-auto !py-1.5 !text-sm`}
            >
              <option value="" disabled>
                {t("quotes.chooseTemplate")}
              </option>
              {PLANTILLAS.map((p) => (
                <option key={p.clave} value={p.clave}>
                  {t(`quotes.templates.${p.clave}.name`)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <ul className="grid gap-3">
          {lineas.map((l, i) => (
            <li key={l.key} className="border-rule bg-paper rounded-xl border p-3">
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_90px_120px_auto] sm:items-end">
                <div>
                  <label htmlFor={`l-c-${l.key}`} className={labelCls}>
                    {t("quotes.concept")} {i + 1}
                  </label>
                  <input
                    id={`l-c-${l.key}`}
                    value={l.concepto}
                    maxLength={160}
                    onChange={(e) => cambiar(l.key, "concepto", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label htmlFor={`l-q-${l.key}`} className={labelCls}>
                    {t("quotes.quantity")}
                  </label>
                  <input
                    id={`l-q-${l.key}`}
                    inputMode="decimal"
                    value={l.cantidad}
                    onChange={(e) => cambiar(l.key, "cantidad", e.target.value)}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <div>
                  <label htmlFor={`l-p-${l.key}`} className={labelCls}>
                    {t("quotes.unitPrice")}
                  </label>
                  <input
                    id={`l-p-${l.key}`}
                    inputMode="decimal"
                    value={l.precio}
                    placeholder="0"
                    onChange={(e) => cambiar(l.key, "precio", e.target.value)}
                    className={`${inputCls} tabular-nums`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setLineas((ls) => ls.filter((x) => x.key !== l.key))}
                  disabled={lineas.length === 1}
                  aria-label={t("quotes.removeLine", { n: i + 1 })}
                  className="btn-secondary !px-3 !py-2.5 !text-sm disabled:opacity-40"
                >
                  {t("common.delete")}
                </button>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                <div>
                  <label htmlFor={`l-d-${l.key}`} className={labelCls}>
                    {t("quotes.detail")}
                  </label>
                  <input
                    id={`l-d-${l.key}`}
                    value={l.detalle}
                    maxLength={500}
                    onChange={(e) => cambiar(l.key, "detalle", e.target.value)}
                    className={inputCls}
                  />
                </div>
                <p className="text-sm tabular-nums sm:pb-2.5">
                  <span className="text-muted mr-2">{t("quotes.lineTotal")}</span>
                  <span className="font-semibold">{euros(num(l.cantidad) * num(l.precio))}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setLineas((ls) => [...ls, nuevaLinea()])}
          className="btn-secondary mt-3 !px-4 !py-2 !text-sm"
        >
          {t("quotes.addLine")}
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="grid content-start gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="q-iva" className={labelCls}>
                {t("quotes.vat")}
              </label>
              <select
                id="q-iva"
                name="iva"
                value={iva}
                onChange={(e) => setIva(e.target.value)}
                className={inputCls}
              >
                {TIPOS_IVA.map((v) => (
                  <option key={v} value={v}>
                    {v === 0 ? t("quotes.vatExempt") : `${v} %`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="q-dto" className={labelCls}>
                {t("quotes.discount")}
              </label>
              <input
                id="q-dto"
                name="descuento"
                inputMode="decimal"
                value={descuento}
                onChange={(e) => setDescuento(e.target.value)}
                className={`${inputCls} tabular-nums`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="q-notas" className={labelCls}>
              {t("quotes.notes")}
            </label>
            <textarea
              id="q-notas"
              name="notas"
              rows={4}
              maxLength={3000}
              defaultValue={inicial?.notas ?? ""}
              placeholder={t("quotes.notesPlaceholder")}
              className={inputCls}
            />
          </div>
        </div>

        <dl className="border-rule bg-paper grid content-start gap-2 rounded-xl border p-4 text-sm tabular-nums">
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t("quotes.subtotal")}</dt>
            <dd>{euros(calculo.subtotal)}</dd>
          </div>
          {calculo.descuento > 0 ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted">{t("quotes.discountLine", { pct: num(descuento) })}</dt>
              <dd>-{euros(calculo.descuento)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t("quotes.taxBase")}</dt>
            <dd>{euros(calculo.base)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{t("quotes.vatLine", { pct: num(iva) })}</dt>
            <dd>{euros(calculo.iva)}</dd>
          </div>
          <div className="border-rule mt-1 flex justify-between gap-4 border-t pt-3 text-lg font-semibold">
            <dt>{t("quotes.total")}</dt>
            <dd>{euros(calculo.total)}</dd>
          </div>
        </dl>
      </div>
    </ActionForm>
  );
}
