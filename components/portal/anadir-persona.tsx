"use client";

import { useRef } from "react";
import { invitarCliente } from "@/lib/portal/actions";
import { ActionForm } from "./action-form";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

/** Botón y ventana para dar de alta a una persona directamente en una empresa. */
export function AnadirPersona({
  empresaId,
  empresaNombre,
}: {
  empresaId: string;
  empresaNombre: string;
}) {
  const { t } = usePT();
  const dialogo = useRef<HTMLDialogElement>(null);
  const cerrar = () => dialogo.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="btn-secondary !px-4 !py-2 !text-sm"
      >
        {t("admin.addPerson")}
      </button>

      <dialog
        ref={dialogo}
        aria-labelledby={`persona-dialogo-${empresaId}`}
        className="border-rule bg-paper text-ink m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border p-5 backdrop:bg-black/50 md:p-6"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={`persona-dialogo-${empresaId}`} className="text-lg font-semibold tracking-tight">
            {t("admin.addPersonTitle", { name: empresaNombre })}
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
          action={invitarCliente}
          submitLabel={t("admin.register")}
          pendingLabel={t("admin.creating")}
          onSuccess={cerrar}
        >
          <input type="hidden" name="empresa_id" value={empresaId} />
          <div className="grid gap-3">
            <div>
              <label htmlFor={`pn-${empresaId}`} className={labelCls}>
                {t("common.name")}
              </label>
              <input
                id={`pn-${empresaId}`}
                name="nombre"
                required
                maxLength={80}
                autoComplete="off"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor={`pe-${empresaId}`} className={labelCls}>
                {t("common.email")}
              </label>
              <input
                id={`pe-${empresaId}`}
                name="email"
                type="email"
                required
                autoComplete="off"
                spellCheck={false}
                className={inputCls}
              />
            </div>
          </div>
        </ActionForm>
        <p className="text-muted mt-3 text-xs">{t("admin.registerHint")}</p>
      </dialog>
    </>
  );
}
