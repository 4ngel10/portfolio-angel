"use client";

import { useEffect, useId, useRef, useState } from "react";
import { inputCls, labelCls } from "./styles";

type Props = {
  empresas: { id: string; nombre: string }[];
  /** Presupuestos enviados o aceptados sin proyecto, con el texto ya listo para mostrar. */
  presupuestos: { id: string; empresa_id: string; etiqueta: string }[];
  defaultEmpresa?: string;
  defaultPresupuesto?: string;
  textos: {
    empresa: string;
    elegirEmpresa: string;
    presupuesto: string;
    sinPresupuesto: string;
    sinDisponibles: string;
    ayuda: string;
    elegirAntes: string;
  };
};

/**
 * Selector de empresa y, debajo, el de presupuesto: solo ofrece los enviados o aceptados de la
 * empresa elegida. Se vuelve a su estado inicial cuando el formulario se vacía tras guardar.
 */
export function EmpresaPresupuesto({
  empresas,
  presupuestos,
  defaultEmpresa = "",
  defaultPresupuesto = "",
  textos,
}: Props) {
  const id = useId();
  const [empresa, setEmpresa] = useState(defaultEmpresa);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = raiz.current?.closest("form");
    if (!form) return;
    const alVaciar = () => setEmpresa("");
    form.addEventListener("reset", alVaciar);
    return () => form.removeEventListener("reset", alVaciar);
  }, []);

  const opciones = presupuestos.filter((p) => p.empresa_id === empresa);

  return (
    <div ref={raiz} className="grid gap-3">
      <div>
        <label htmlFor={`${id}-empresa`} className={labelCls}>
          {textos.empresa}
        </label>
        <select
          id={`${id}-empresa`}
          name="empresa_id"
          required
          value={empresa}
          onChange={(e) => setEmpresa(e.target.value)}
          className={inputCls}
        >
          <option value="" disabled>
            {textos.elegirEmpresa}
          </option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nombre}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-presupuesto`} className={labelCls}>
          {textos.presupuesto}
        </label>
        {/* key: al cambiar de empresa el selector vuelve a "Sin presupuesto". */}
        <select
          key={empresa}
          id={`${id}-presupuesto`}
          name="presupuesto_id"
          disabled={!empresa || opciones.length === 0}
          defaultValue={empresa === defaultEmpresa ? defaultPresupuesto : ""}
          aria-describedby={`${id}-ayuda`}
          className={inputCls}
        >
          <option value="">
            {empresa && opciones.length === 0 ? textos.sinDisponibles : textos.sinPresupuesto}
          </option>
          {opciones.map((p) => (
            <option key={p.id} value={p.id}>
              {p.etiqueta}
            </option>
          ))}
        </select>
        <p id={`${id}-ayuda`} className="text-muted mt-1.5 text-xs">
          {empresa ? textos.ayuda : textos.elegirAntes}
        </p>
      </div>
    </div>
  );
}
