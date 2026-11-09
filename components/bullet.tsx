/**
 * Marca de las listas: un punto pequeño en el color de acento, centrado con la primera línea del texto.
 * La altura del contenedor es 1lh (la altura de línea del texto que lo acompaña), así el punto
 * queda alineado con cualquier tamaño o interlineado sin números mágicos.
 */
export function Bullet() {
  return (
    <span className="flex h-[1lh] shrink-0 items-center" aria-hidden>
      <span className="h-1 w-1 rounded-full" style={{ background: "var(--accent)" }} />
    </span>
  );
}
