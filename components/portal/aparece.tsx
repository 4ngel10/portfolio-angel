/**
 * Envoltorio de cada bloque del portal. Hoy no anima nada: es el único punto donde se
 * añadirá la entrada con Framer Motion (Paso 10), para no tocar las páginas.
 */
export function Aparece({ children }: { children: React.ReactNode; retraso?: number }) {
  return <div>{children}</div>;
}
