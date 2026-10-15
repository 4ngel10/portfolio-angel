type Props = {
  items: string[];
  /** Segundos por vuelta completa. */
  speed?: number;
  gap?: string;
  direction?: "left" | "right";
  itemClassName?: string;
  separator?: React.ReactNode;
  /**
   * Veces que se repite la lista dentro de cada grupo. Cada grupo debe ser
   * al menos tan ancho como la pantalla o se ve el hueco del final del bucle.
   * La velocidad visual no cambia: la duración se multiplica por lo mismo.
   */
  repeat?: number;
};

/**
 * Carrusel infinito en CSS puro (estilos .carousel en globals.css).
 * Dos grupos idénticos se desplazan su ancho + gap, así el bucle no salta.
 * Solo la primera copia de la lista es legible por lectores de pantalla.
 */
export function Carousel({
  items,
  speed = 40,
  gap = "3rem",
  direction = "left",
  itemClassName = "",
  separator,
  repeat = 1,
}: Props) {
  const copies = Array.from({ length: repeat }, (_, i) => i);

  const group = (hidden: boolean) => (
    <div className="carousel-group" aria-hidden={hidden || undefined}>
      {copies.map((copy) =>
        items.map((item) => (
          <span
            key={`${copy}-${item}`}
            className="flex items-center"
            style={{ columnGap: gap }}
            aria-hidden={(!hidden && copy > 0) || undefined}
          >
            <span className={`carousel-item ${itemClassName}`}>{item}</span>
            {separator}
          </span>
        )),
      )}
    </div>
  );

  return (
    <div
      className={`carousel ${direction === "right" ? "carousel-right" : ""}`}
      style={
        { "--carousel-speed": `${speed * repeat}s`, "--carousel-gap": gap } as React.CSSProperties
      }
    >
      {group(false)}
      {group(true)}
    </div>
  );
}
