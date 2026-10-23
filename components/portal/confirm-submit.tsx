"use client";

/** Botón de envío que pide confirmación antes de una acción destructiva. */
export function ConfirmSubmit({
  mensaje,
  children,
  className = "",
  label,
}: {
  mensaje: string;
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <button
      type="submit"
      aria-label={label}
      className={className}
      onClick={(e) => {
        if (!window.confirm(mensaje)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
