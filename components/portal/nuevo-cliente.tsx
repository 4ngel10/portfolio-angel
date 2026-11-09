"use client";

import { useEffect, useId, useRef, useState } from "react";
import { crearCliente } from "@/lib/portal/actions";
import { ActionForm } from "./action-form";
import { usePT } from "./i18n-provider";
import { InvitarCasilla } from "./invitar-casilla";
import { inputCls, labelCls } from "./styles";

/**
 * Botón "Nuevo cliente" y su ventana: la empresa (nueva o una que ya existe) y su primera
 * persona en un solo paso. `abrirAlCargar` la abre al llegar con ?nuevo=1. Es un <dialog>
 * nativo: Escape lo cierra y el foco vuelve al botón.
 */
export function NuevoCliente({
  empresas,
  abrirAlCargar = false,
}: {
  empresas: { id: string; nombre: string }[];
  abrirAlCargar?: boolean;
}) {
  const { t } = usePT();
  const id = useId();
  const dialogo = useRef<HTMLDialogElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const [empresa, setEmpresa] = useState("");

  useEffect(() => {
    if (abrirAlCargar && dialogo.current && !dialogo.current.open) dialogo.current.showModal();
  }, [abrirAlCargar]);

  const cerrar = () => dialogo.current?.close();

  return (
    <>
      <button
        ref={boton}
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="btn-primary !px-5 !py-2.5 !text-sm"
      >
        {t("admin.newClient")}
      </button>

      <dialog
        ref={dialogo}
        onClose={() => {
          setEmpresa("");
          boton.current?.focus();
        }}
        aria-labelledby={`${id}-titulo`}
        className="border-rule bg-paper text-ink m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl border p-5 backdrop:bg-black/50 md:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={`${id}-titulo`} className="text-lg font-semibold tracking-tight">
            {t("admin.newClient")}
          </h2>
          <button
            type="button"
            onClick={cerrar}
            className="text-muted hover:text-ink shrink-0 text-sm underline underline-offset-4"
          >
            {t("admin.cancel")}
          </button>
        </div>
        <ActionForm
          action={crearCliente}
          submitLabel={t("admin.registerClient")}
          pendingLabel={t("admin.creating")}
          onSuccess={() => setEmpresa("")}
        >
          <div className="grid gap-4">
            <div>
              <label htmlFor={`${id}-empresa`} className={labelCls}>
                {t("common.company")}
              </label>
              <select
                id={`${id}-empresa`}
                name="empresa_id"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                className={inputCls}
              >
                <option value="">{t("admin.companyNew")}</option>
                {empresas.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
            {empresa === "" ? (
              <div>
                <label htmlFor={`${id}-nombre-empresa`} className={labelCls}>
                  {t("admin.companyNameLabel")}
                </label>
                <input
                  id={`${id}-nombre-empresa`}
                  name="empresa_nombre"
                  required
                  maxLength={80}
                  autoComplete="off"
                  className={inputCls}
                />
              </div>
            ) : null}

            <fieldset className="border-rule grid gap-3 rounded-xl border p-4">
              <legend className="px-1 text-sm font-semibold">{t("admin.firstPerson")}</legend>
              <div>
                <label htmlFor={`${id}-nombre`} className={labelCls}>
                  {t("common.name")}
                </label>
                <input
                  id={`${id}-nombre`}
                  name="nombre"
                  required
                  maxLength={80}
                  autoComplete="off"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor={`${id}-email`} className={labelCls}>
                  {t("common.email")}
                </label>
                <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  className={inputCls}
                />
              </div>
            </fieldset>

            <InvitarCasilla />
          </div>
        </ActionForm>
      </dialog>
    </>
  );
}
