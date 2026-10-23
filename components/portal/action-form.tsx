"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";
import type { FormState } from "@/lib/portal/validate";

/**
 * Formulario ligado a una Server Action con estado (error o confirmación).
 * Tras un envío correcto se vacía.
 */
export function ActionForm({
  action,
  submitLabel,
  pendingLabel = "Guardando",
  children,
  className = "",
  secondary = false,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  submitLabel: string;
  pendingLabel?: string;
  children: ReactNode;
  className?: string;
  secondary?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) ref.current?.reset();
  }, [state]);

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
          {state.ok && state.message ? <span className="text-muted">{state.message}</span> : null}
        </p>
      </div>
    </form>
  );
}
