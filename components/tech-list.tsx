type Props = {
  items: string[];
  /** Separación entre tecnologías, en rem. */
  gap?: string;
  itemClassName?: string;
  separator?: React.ReactNode;
  /** Nombre accesible de la lista, en el idioma activo. */
  label?: string;
};

/**
 * Lista de tecnologías, estática y para todos los visitantes: centrada, en varias líneas y
 * sin movimiento. Antes era una marquesina infinita; sin mecanismo de pausa no cumple WCAG 2.2.2
 * (contenido en movimiento de más de 5 s), así que ya no se mueve.
 * Los separadores son decorativos (aria-hidden).
 */
export function TechList({ items, gap = "2.5rem", itemClassName = "", separator, label }: Props) {
  return (
    <ul
      aria-label={label}
      className="flex flex-wrap items-center justify-center gap-y-2 px-6 py-2"
      style={{ columnGap: gap }}
    >
      {items.map((item) => (
        <li key={item} className="flex items-center" style={{ columnGap: gap }}>
          <span className={itemClassName}>{item}</span>
          {separator}
        </li>
      ))}
    </ul>
  );
}
