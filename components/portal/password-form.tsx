"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

/** Primera entrada del cliente (o enlace de "contraseña olvidada"): elige su contraseña. */
export function PasswordForm({
  temporal = false,
  admin = false,
}: {
  temporal?: boolean;
  /** El admin recupera su contraseña con el mismo formulario: más larga y sin rastro de portal. */
  admin?: boolean;
}) {
  const router = useRouter();
  const minimo = admin ? 12 : 8;
  const { t } = usePT();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const corta = admin ? t("password.tooShortAdmin") : t("password.tooShort");
    if (password.length < minimo) return setError(corta);
    if (password !== repeat) return setError(t("password.mismatch"));

    setError(null);
    setGuardando(true);
    // `password_set` marca que ya eligió contraseña: el portal deja de pedírsela.
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser(
      admin ? { password } : { password, data: { password_set: true, password_temporary: false } },
    );
    if (error) {
      setGuardando(false);
      setError(error.code === "weak_password" ? corta : t("password.failed"));
      return;
    }
    // Con la contraseña nueva se cierran las demás sesiones del admin: si alguien la tenía, sale.
    if (admin) await supabase.auth.signOut({ scope: "others" });
    router.replace(admin ? "/admin" : "/portal");
    router.refresh();
  }

  return (
    <form onSubmit={guardar} noValidate>
      <h1 className="text-2xl font-semibold tracking-tight">{t("password.title")}</h1>
      <p className="text-muted mt-3">
        {t(admin ? "password.introAdmin" : temporal ? "password.tempIntro" : "password.intro")}
      </p>

      <label htmlFor="new-password" className={`${labelCls} mt-6`}>
        {t("password.newLabel")}
      </label>
      <input
        id="new-password"
        type="password"
        autoComplete="new-password"
        required
        minLength={minimo}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputCls}
        aria-describedby="password-hint"
      />
      <p id="password-hint" className="text-muted mt-1.5 text-sm">
        {t(admin ? "password.hintAdmin" : "password.hint")}
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

      <button
        type="submit"
        disabled={guardando || !password || !repeat}
        className="btn-primary mt-5 w-full disabled:opacity-60"
      >
        {guardando ? t("password.saving") : t("password.submit")}
      </button>
    </form>
  );
}
