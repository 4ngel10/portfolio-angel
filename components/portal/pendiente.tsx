import Link from "next/link";

export type ItemPendiente = {
  icono: "presupuesto" | "cobro" | "incidencia" | "bolsa" | "articulo";
  texto: string;
  /** Texto corto en el acento al final de la fila (plazo, retraso...). */
  aviso?: string;
  href: string;
};

const ICONOS: Record<ItemPendiente["icono"], React.ReactNode> = {
  presupuesto: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
    </>
  ),
  cobro: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </>
  ),
  incidencia: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  articulo: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  bolsa: (
    <>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </>
  ),
};

/** Lista de lo que pide acción hoy: cada fila lleva su icono, el texto y un enlace directo. */
export function ListaPendiente({ items }: { items: ItemPendiente[] }) {
  return (
    <ul className="divide-y divide-[var(--rule)]">
      {items.map((it, i) => (
        <li key={i}>
          <Link
            href={it.href}
            className="group -mx-2 flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors duration-150 hover:bg-[var(--chip)] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="text-muted mt-0.5 size-5 shrink-0 transition-colors group-hover:text-[var(--accent)]"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              {ICONOS[it.icono]}
            </svg>
            <span className="min-w-0 flex-1 text-sm">
              <span className="break-words">{it.texto}</span>
              {it.aviso ? (
                <span className="mt-0.5 block text-xs font-medium text-[var(--accent)]">
                  {it.aviso}
                </span>
              ) : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
