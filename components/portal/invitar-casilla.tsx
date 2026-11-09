"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePT } from "./i18n-provider";

/**
 * Casilla "Enviar invitación por correo" (marcada por defecto) y el texto que explica qué
 * pasará en cada caso. Vuelve a marcarse cuando el formulario se vacía tras guardar.
 */
export function InvitarCasilla() {
  const { t } = usePT();
  const id = useId();
  const [activa, setActiva] = useState(true);
  const raiz = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const form = raiz.current?.closest("form");
    if (!form) return;
    const alVaciar = () => setActiva(true);
    form.addEventListener("reset", alVaciar);
    return () => form.removeEventListener("reset", alVaciar);
  }, []);

  return (
    <div ref={raiz}>
      <label htmlFor={id} className="flex items-center gap-2.5 text-sm font-medium">
        <input
          id={id}
          type="checkbox"
          name="invitar"
          checked={activa}
          onChange={(e) => setActiva(e.target.checked)}
          aria-describedby={`${id}-ayuda`}
          className="size-4 accent-[var(--accent)]"
        />
        {t("admin.inviteByEmail")}
      </label>
      <p id={`${id}-ayuda`} className="text-muted mt-1.5 text-xs">
        {activa ? t("admin.inviteHintOn") : t("admin.registerHint")}
      </p>
    </div>
  );
}
