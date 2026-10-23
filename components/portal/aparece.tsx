/**
 * Entrada de cada bloque del portal (ver .aparece en globals.css). `retraso` en segundos:
 * se usa en pasos de 0,05 para escalonar los bloques de una misma pantalla.
 * Es CSS puro: no añade JavaScript al cliente y no depende de la hidratación.
 */
export function Aparece({ children, retraso = 0 }: { children: React.ReactNode; retraso?: number }) {
  return (
    <div className="aparece" style={{ "--aparece-delay": `${retraso}s` } as React.CSSProperties}>
      {children}
    </div>
  );
}
