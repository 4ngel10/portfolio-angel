type Props = {
  items: React.ReactNode[];
  /** Segundos por vuelta completa. */
  duration?: number;
  reverse?: boolean;
  className?: string;
  itemClassName?: string;
  separator?: React.ReactNode;
  label?: string;
};

/**
 * Marquee infinito en CSS puro. El contenido se renderiza dos veces y el track
 * se desplaza un 50%, así el bucle no tiene saltos. La copia va aria-hidden.
 */
export function Marquee({
  items,
  duration = 40,
  reverse = false,
  className = "",
  itemClassName = "",
  separator,
  label,
}: Props) {
  const row = (hidden: boolean) => (
    <div className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((item, i) => (
        <span key={i} className={`flex shrink-0 items-center ${itemClassName}`}>
          {item}
          {separator}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`marquee ${reverse ? "marquee-reverse" : ""} ${className}`}
      style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      role={label ? "region" : undefined}
      aria-label={label}
    >
      <div className="marquee-track">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}

export function MarqueeDot() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className="mx-6 shrink-0 md:mx-8"
      style={{ color: "var(--accent)" }}
      aria-hidden
    >
      <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
    </svg>
  );
}
