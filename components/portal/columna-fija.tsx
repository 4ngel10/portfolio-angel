"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Columna lateral que acompaña al hacer scroll desde `lg` (sticky). Si su contenido es más alto
 * que la ventana (con "Editar" abierto, muchas personas, una ventana baja) no se fija: un sticky
 * más alto que la pantalla dejaría su parte de abajo inalcanzable, así que en ese caso se
 * desplaza con la página como cualquier otro bloque.
 */
export function ColumnaFija({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [cabe, setCabe] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // top-6 (24px) arriba y el mismo margen abajo.
    const medir = () => setCabe(el.offsetHeight + 48 <= window.innerHeight);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(el);
    window.addEventListener("resize", medir);
    return () => {
      obs.disconnect();
      window.removeEventListener("resize", medir);
    };
  }, []);

  return (
    <div ref={ref} className={`${className} ${cabe ? "lg:sticky lg:top-6" : ""}`}>
      {children}
    </div>
  );
}
