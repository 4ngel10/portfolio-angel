"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import type { FormState } from "@/lib/portal/validate";

/**
 * Formulario ligado a una Server Action con estado (error o confirmación).
 * Tras un envío correcto se vacía. Con `messageTimeout` la confirmación desaparece sola
 * pasado ese tiempo (ms); los errores se quedan hasta el siguiente envío.
 */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Guardando",
  children,
  className = "",
  secondary = false,
  messageTimeout,
  onSuccess,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  children: ReactNode;
  className?: string;
  secondary?: boolean;
  messageTimeout?: number;
  /** Se llama una vez por cada envío correcto, con el estado devuelto por la acción. */
  onSuccess?: (state: FormState) => void;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const ref = useRef<HTMLFormElement>(null);

  // Confirmación ya retirada: se compara con el estado actual, así un envío nuevo la vuelve a mostrar.
  const [retirado, setRetirado] = useState<FormState | null>(null);

  // El callback va en un ref para que cambiar de función entre renders no repita el efecto.
  const alExito = useRef(onSuccess);
  useEffect(() => {
    alExito.current = onSuccess;
  });

  useEffect(() => {
    if (state.ok) {
      ref.current?.reset();
      alExito.current?.(state);
    }
    if (!state.ok || !state.message || !messageTimeout) return;
    const timer = setTimeout(() => setRetirado(state), messageTimeout);
    return () => clearTimeout(timer);
  }, [state, messageTimeout]);

  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className={`${secondary ? "btn-secondary" : "btn-primary"} disabled:opacity-60`}
        >
          {pending ? pendingLabel : submitLabel}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {state.error ? <span className="text-[var(--accent)]">{state.error}</span> : null}
          {state.ok && state.message && retirado !== state ? (
            <span className="text-muted">{state.message}</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
