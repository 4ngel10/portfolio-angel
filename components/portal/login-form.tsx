"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

type Estado = "idle" | "enviando" | "enviado";

export function LoginForm({ aviso }: { aviso?: string }) {
  const { t } = usePT();
  const [estado, setEstado] = useState<Estado>("idle");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEstado("enviando");

    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false, // solo entran las personas que dio de alta el admin
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // Si el correo no está dado de alta Supabase devuelve un error de "registro no permitido".
    // Se muestra la misma confirmación para no revelar qué correos existen.
    if (error && error.code !== "otp_disabled" && !/signups not allowed/i.test(error.message)) {
      setEstado("idle");
      setError(error.status === 429 ? t("login.rateLimit") : t("login.sendFailed"));
      return;
    }
    setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <div role="status" aria-live="polite">
        <h1 className="text-2xl font-semibold tracking-tight">{t("login.sentTitle")}</h1>
        <p className="mt-3 text-muted">{t("login.sentBody")}</p>
        <p className="mt-3 break-all font-medium">{email}</p>
        <button
          type="button"
          onClick={() => setEstado("idle")}
          className="mt-6 text-sm font-medium text-ink underline underline-offset-4 hover:text-accent"
        >
          {t("login.useOther")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} noValidate>
      <h1 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
      <p className="mt-3 text-muted">{t("login.intro")}</p>

      {aviso ? (
        <p role="alert" className="mt-5 rounded-xl border border-rule bg-chip px-4 py-3 text-sm">
          {aviso}
        </p>
      ) : null}

      <label htmlFor="email" className={`${labelCls} mt-6`}>
        {t("login.emailLabel")}
      </label>
      <input
        id="email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        spellCheck={false}
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("login.emailPlaceholder")}
        className={inputCls}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "login-error" : undefined}
      />

      {error ? (
        <p id="login-error" role="alert" className="mt-3 text-sm text-[var(--accent)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={estado === "enviando" || !email.includes("@")}
        className="btn-primary mt-5 w-full disabled:opacity-60"
      >
        {estado === "enviando" ? t("login.sending") : t("login.submit")}
      </button>
    </form>
  );
}
