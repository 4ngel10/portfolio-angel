"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

/** Primera entrada del cliente (o enlace de "contraseña olvidada"): elige su contraseña. */
export function PasswordForm({ temporal = false }: { temporal?: boolean }) {
  const router = useRouter();
  const { t } = usePT();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (password.length < 8) return setError(t("password.tooShort"));
    if (password !== repeat) return setError(t("password.mismatch"));

    setError(null);
    setGuardando(true);
    // `password_set` marca que ya eligió contraseña: el portal deja de pedírsela.
    const { error } = await createClient().auth.updateUser({ password, data: { password_set: true, password_temporary: false } });
    if (error) {
      setGuardando(false);
      setError(error.code === "weak_password" ? t("password.tooShort") : t("password.failed"));
      return;
    }
    router.replace("/portal");
    router.refresh();
  }

  return (
    <form onSubmit={guardar} noValidate>
      <h1 className="text-2xl font-semibold tracking-tight">{t("password.title")}</h1>
      <p className="mt-3 text-muted">{t(temporal ? "password.tempIntro" : "password.intro")}</p>

      <label htmlFor="new-password" className={`${labelCls} mt-6`}>
        {t("password.newLabel")}
      </label>
      <input
        id="new-password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputCls}
        aria-describedby="password-hint"
      />
      <p id="password-hint" className="mt-1.5 text-sm text-muted">
        {t("password.hint")}
      </p>

      <label htmlFor="repeat-password" className={`${labelCls} mt-4`}>
        {t("password.confirmLabel")}
      </label>
      <input
        id="repeat-password"
        type="password"
        autoComplete="new-password"
        required
        value={repeat}
        onChange={(e) => setRepeat(e.target.value)}
        className={inputCls}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "password-error" : undefined}
      />

      {error ? (
        <p id="password-error" role="alert" className="mt-3 text-sm text-[var(--accent)]">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={guardando || !password || !repeat} className="btn-primary mt-5 w-full disabled:opacity-60">
        {guardando ? t("password.saving") : t("password.submit")}
      </button>
    </form>
  );
}
