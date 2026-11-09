"use client";

import { useRef, useState } from "react";
import { archivarCliente, eliminarCliente, restaurarCliente } from "@/lib/portal/clientes-actions";
import { ActionForm } from "./action-form";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

const claseDialogo =
  "border-rule bg-paper text-ink m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border p-5 backdrop:bg-black/50 md:p-6";

function Cabecera({
  id,
  titulo,
  onCerrar,
  cancelar,
}: {
  id: string;
  titulo: string;
  onCerrar: () => void;
  cancelar: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <h2 id={id} className="text-lg font-semibold tracking-tight">
        {titulo}
      </h2>
      <button
        type="button"
        onClick={onCerrar}
        className="text-muted hover:text-ink shrink-0 text-sm underline underline-offset-4"
      >
        {cancelar}
      </button>
    </div>
  );
}

/** Botón "Archivar cliente" y ventana de confirmación que explica qué pasa. */
export function ArchivarCliente({ empresaId, nombre }: { empresaId: string; nombre: string }) {
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
        {t("admin.archiveClient")}
      </button>
      <dialog ref={dialogo} aria-labelledby={`archivar-${empresaId}`} className={claseDialogo}>
        <Cabecera
          id={`archivar-${empresaId}`}
          titulo={t("admin.archiveTitle", { name: nombre })}
          onCerrar={cerrar}
          cancelar={t("admin.cancel")}
        />
        <ul className="text-muted grid list-disc gap-1.5 pl-5 text-sm">
          <li>{t("admin.archiveLists")}</li>
          <li>{t("admin.archivePeople")}</li>
          <li>{t("admin.archiveKept")}</li>
          <li>{t("admin.archiveRestore")}</li>
        </ul>
        <ActionForm
          action={archivarCliente}
          submitLabel={t("admin.archiveConfirm")}
          pendingLabel={t("admin.archiving")}
          onSuccess={cerrar}
        >
          <input type="hidden" name="id" value={empresaId} />
        </ActionForm>
      </dialog>
    </>
  );
}

/** Botón "Restaurar" de la banda de un cliente archivado. */
export function RestaurarCliente({ empresaId }: { empresaId: string }) {
  const { t } = usePT();
  return (
    <ActionForm
      action={restaurarCliente}
      submitLabel={t("admin.restoreClient")}
      pendingLabel={t("admin.restoring")}
      secondary
      messageTimeout={3000}
    >
      <input type="hidden" name="id" value={empresaId} />
    </ActionForm>
  );
}

export type ConteoEmpresa = {
  proyectos: number;
  incidencias: number;
  presupuestos: number;
  movimientos: number;
  cobros: number;
  personas: number;
  ficheros: number;
  conPagos: boolean;
};

/**
 * Enlace "Eliminar definitivamente" y su ventana. Muestra lo que se borra con números y exige
 * escribir el nombre de la empresa. Con pagos registrados solo explica por qué no se puede.
 */
export function EliminarCliente({
  empresaId,
  nombre,
  conteo,
}: {
  empresaId: string;
  nombre: string;
  conteo: ConteoEmpresa;
}) {
  const { t } = usePT();
  const dialogo = useRef<HTMLDialogElement>(null);
  const [escrito, setEscrito] = useState("");
  const cerrar = () => dialogo.current?.close();
  const filas = [
    [t("admin.delProjects"), conteo.proyectos],
    [t("admin.delIncidents"), conteo.incidencias],
    [t("admin.delQuotes"), conteo.presupuestos],
    [t("admin.delMovements"), conteo.movimientos],
    [t("admin.delCharges"), conteo.cobros],
    [t("admin.delPeople"), conteo.personas],
    [t("admin.delFiles"), conteo.ficheros],
  ] as const;

  return (
    <>
      <button
        type="button"
        onClick={() => dialogo.current?.showModal()}
        className="text-sm text-[var(--accent)] underline underline-offset-4"
      >
        {t("admin.deleteForever")}
      </button>
      <dialog
        ref={dialogo}
        aria-labelledby={`eliminar-${empresaId}`}
        onClose={() => setEscrito("")}
        className={claseDialogo}
      >
        <Cabecera
          id={`eliminar-${empresaId}`}
          titulo={t("admin.deleteTitle", { name: nombre })}
          onCerrar={cerrar}
          cancelar={t("admin.cancel")}
        />
        {conteo.conPagos ? (
          <p role="alert" className="text-sm">
            {t("admin.deleteHasPayments")}
          </p>
        ) : (
          <>
            <p className="text-sm font-medium">{t("admin.deleteIntro")}</p>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
              {filas.map(([etiqueta, n]) => (
                <div key={etiqueta} className="flex justify-between gap-3">
                  <dt className="text-muted">{etiqueta}</dt>
                  <dd className="font-semibold tabular-nums">{n}</dd>
                </div>
              ))}
            </dl>
            <ActionForm
              action={eliminarCliente}
              submitLabel={t("admin.deleteNow")}
              pendingLabel={t("admin.deleting")}
              submitDisabled={escrito.trim() !== nombre}
            >
              <input type="hidden" name="id" value={empresaId} />
              <div className="mt-4">
                <label htmlFor={`eliminar-nombre-${empresaId}`} className={labelCls}>
                  {t("admin.deleteTypeName", { name: nombre })}
                </label>
                <input
                  id={`eliminar-nombre-${empresaId}`}
                  name="confirmar"
                  value={escrito}
                  onChange={(e) => setEscrito(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  className={inputCls}
                />
              </div>
            </ActionForm>
          </>
        )}
      </dialog>
    </>
  );
}
