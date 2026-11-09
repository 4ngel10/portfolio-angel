"use client";

import { useEffect, useRef, useState } from "react";
import type { Empresa } from "@/lib/portal/types";
import { EmpresaDetalles } from "./empresa-detalles";
import { usePT } from "./i18n-provider";

type Datos = Pick<Empresa, "id" | "sector" | "actividad" | "ubicacion" | "telefono" | "web">;

/**
 * Panel "Datos de la empresa": en lectura muestra solo los datos rellenos; el botón de la
 * cabecera abre el formulario en el mismo panel y vuelve a la lectura al guardar o cancelar.
 * Foco: al abrir va al primer campo y al cerrar vuelve al botón (que sigue montado).
 */
export function EmpresaDatos({ empresa }: { empresa: Datos }) {
  const { t } = usePT();
  const [editando, setEditando] = useState(false);
  const [aviso, setAviso] = useState("");
  const boton = useRef<HTMLButtonElement>(null);
  const abierto = useRef(false);

  useEffect(() => {
    if (editando) {
      document.getElementById(`emp-${empresa.id}-sector`)?.focus();
      abierto.current = true;
    } else if (abierto.current) {
      abierto.current = false;
      boton.current?.focus();
    }
  }, [editando, empresa.id]);

  const filas: { clave: string; etiqueta: string; valor: string }[] = [
    {
      clave: "sector",
      etiqueta: t("admin.sector"),
      valor: empresa.sector ? t(`sectors.${empresa.sector}`) : "",
    },
    { clave: "actividad", etiqueta: t("admin.activity"), valor: empresa.actividad ?? "" },
    { clave: "ubicacion", etiqueta: t("admin.location"), valor: empresa.ubicacion ?? "" },
    { clave: "telefono", etiqueta: t("admin.phone"), valor: empresa.telefono ?? "" },
    { clave: "web", etiqueta: t("admin.website"), valor: empresa.web ?? "" },
  ].filter((f) => f.valor);

  return (
    <section className="border-rule bg-paper-alt rounded-2xl border p-5 md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight">{t("admin.companyDetails")}</h2>
        <button
          ref={boton}
          type="button"
          aria-expanded={editando}
          onClick={() => {
            setAviso("");
            setEditando((e) => !e);
          }}
          className="hover:text-accent text-sm underline underline-offset-4"
        >
          {editando ? t("admin.cancel") : t("admin.edit")}
        </button>
      </div>

      {editando ? (
        <EmpresaDetalles
          empresa={empresa}
          onSuccess={(estado) => {
            setAviso(estado.message ?? "");
            setEditando(false);
          }}
        />
      ) : filas.length === 0 ? (
        <p className="text-muted text-sm">{t("admin.noDetailsYet")}</p>
      ) : (
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
          {filas.map((f) => (
            <div key={f.clave} className="min-w-0">
              <dt className="text-muted">{f.etiqueta}</dt>
              <dd className="mt-0.5 font-medium break-words">
                {f.clave === "web" ? (
                  <a
                    href={f.valor}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-accent underline underline-offset-4"
                  >
                    {f.valor}
                  </a>
                ) : (
                  f.valor
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
      <p role="status" aria-live="polite" className="text-muted mt-3 text-sm empty:hidden">
        {aviso}
      </p>
    </section>
  );
}
