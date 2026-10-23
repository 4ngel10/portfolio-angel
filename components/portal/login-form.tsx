"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

type Modo = "password" | "enlace";
type Estado = "idle" | "enviando" | "enviado";

export function LoginForm({ aviso }: { aviso?: string }) {
  const router = useRouter();
  const { t } = usePT();
  const [modo, setModo] = useState<Modo>("password");
  const [estado, setEstado] = useState<Estado>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function cambiarModo(nuevo: Modo) {
    setModo(nuevo);
    setError(null);
  }

  async function entrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEstado("enviando");

    const { error } = await createClient().auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setEstado("idle");
      setError(error.status === 429 ? t("login.rateLimit") : t("login.invalid"));
      return;
    }
    // /login ya manda a cada rol a su zona al detectar la sesión.
    router.refresh();
  }

  async function enviarEnlace(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEstado("enviando");

    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        shouldCreateUser: false, // solo entran las personas que dio de alta el admin
        // `contrasena=1`: al abrir el enlace, el cliente elige (o cambia) su contraseña.
        emailRedirectTo: `${window.location.origin}/auth/callback?contrasena=1`,
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

  const conPassword = modo === "password";

  return (
    <form onSubmit={conPassword ? entrar : enviarEnlace} noValidate>
      <h1 className="text-2xl font-semibold tracking-tight">{t("login.title")}</h1>
      <p className="mt-3 text-muted">{conPassword ? t("login.intro") : t("login.linkIntro")}</p>

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
        autoComplete="username"
        spellCheck={false}
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t("login.emailPlaceholder")}
        className={inputCls}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "login-error" : undefined}
      />

      {conPassword ? (
        <>
          <label htmlFor="password" className={`${labelCls} mt-4`}>
            {t("login.passwordLabel")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "login-error" : undefined}
          />
        </>
      ) : null}

      {error ? (
        <p id="login-error" role="alert" className="mt-3 text-sm text-[var(--accent)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={estado === "enviando" || !email.includes("@") || (conPassword && !password)}
        className="btn-primary mt-5 w-full disabled:opacity-60"
      >
        {conPassword
          ? estado === "enviando"
            ? t("login.sending")
            : t("login.submit")
          : estado === "enviando"
            ? t("login.linkSending")
            : t("login.linkSubmit")}
      </button>

      <button
        type="button"
        onClick={() => cambiarModo(conPassword ? "enlace" : "password")}
        className="mt-5 block w-full text-center text-sm font-medium text-ink underline underline-offset-4 hover:text-accent"
      >
        {conPassword ? t("login.firstTime") : t("login.backToPassword")}
      </button>
    </form>
  );
}
