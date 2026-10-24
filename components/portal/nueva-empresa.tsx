"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { crearEmpresa } from "@/lib/portal/actions";
import type { FormState } from "@/lib/portal/validate";
import { ActionForm } from "./action-form";
import { EmpresaDetalles } from "./empresa-detalles";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

/**
 * Alta de empresa en dos pasos: el nombre, y al crearla se abre una ventana para pedir
 * sus datos básicos (a qué se dedica, ubicación, contacto). Se pueden omitir y completar
 * después desde la ficha de la empresa.
 */
export function NuevaEmpresa() {
  const { t } = usePT();
  const dialogo = useRef<HTMLDialogElement>(null);
  const [creada, setCreada] = useState<{ id: string; nombre: string } | null>(null);

  useEffect(() => {
    const el = dialogo.current;
    if (creada && el && !el.open) el.showModal();
  }, [creada]);

  const alCrear = useCallback((state: FormState) => {
    if (state.empresa) setCreada(state.empresa);
  }, []);

  const cerrar = () => dialogo.current?.close();

  return (
    <>
      <ActionForm
        action={crearEmpresa}
        submitLabel={t("admin.createCompany")}
        pendingLabel={t("admin.creating")}
        onSuccess={alCrear}
      >
        <label htmlFor="emp-nombre" className={labelCls}>
          {t("common.name")}
        </label>
        <input id="emp-nombre" name="nombre" required maxLength={80} className={inputCls} />
      </ActionForm>

      <dialog
        ref={dialogo}
        onClose={() => setCreada(null)}
        aria-labelledby="emp-dialogo-titulo"
        className="border-rule bg-paper text-ink m-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl border p-5 backdrop:bg-black/50 md:p-6"
      >
        {creada ? (
          <>
            <div className="mb-1 flex items-start justify-between gap-4">
              <h2 id="emp-dialogo-titulo" className="text-lg font-semibold tracking-tight">
                {t("admin.companyDetailsTitle", { name: creada.nombre })}
              </h2>
              <button
                type="button"
                onClick={cerrar}
                className="text-muted hover:text-ink shrink-0 text-sm underline underline-offset-4"
              >
                {t("admin.notNow")}
              </button>
            </div>
            <p className="text-muted mb-4 text-sm">{t("admin.companyDetailsIntro")}</p>
            <EmpresaDetalles
              empresa={{
                id: creada.id,
                sector: null,
                actividad: null,
                ubicacion: null,
                telefono: null,
                web: null,
              }}
              onSuccess={cerrar}
            />
          </>
        ) : null}
      </dialog>
    </>
  );
}
