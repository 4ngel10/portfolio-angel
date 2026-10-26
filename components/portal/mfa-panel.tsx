"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

type Fase = "cargando" | "enrolar" | "verificar" | "error";

/**
 * Segundo factor (TOTP) del administrador. Primera vez: muestra el QR para la app de
 * autenticación y confirma con un código. Después: pide el código de 6 dígitos en cada sesión.
 */
export function MfaPanel({ destino = "/admin" }: { destino?: "/admin" | "/contrasena" }) {
  const router = useRouter();
  const { t } = usePT();
  const supabase = createClient();
  const [fase, setFase] = useState<Fase>("cargando");
  const [factorId, setFactorId] = useState("");
  const [qr, setQr] = useState("");
  const [secreto, setSecreto] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    let vivo = true;
    (async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (!vivo) return;
      if (error) {
        setError(t("mfa.checkError"));
        setFase("error");
        return;
      }
      const verificado = data.totp[0]; // `totp` solo lista factores ya verificados
      if (verificado) {
        setFactorId(verificado.id);
        setFase("verificar");
        return;
      }
      // Limpia intentos de alta anteriores a medias antes de crear uno nuevo.
      for (const f of data.all.filter(
        (f) => f.factor_type === "totp" && f.status === "unverified",
      )) {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
      const alta = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: t("mfa.factorName"),
      });
      if (!vivo) return;
      if (alta.error || !alta.data) {
        setError(t("mfa.enrollError"));
        setFase("error");
        return;
      }
      setFactorId(alta.data.id);
      setQr(alta.data.totp.qr_code);
      setSecreto(alta.data.totp.secret);
      setFase("enrolar");
    })();
    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    const { data: reto, error: errReto } = await supabase.auth.mfa.challenge({ factorId });
    if (errReto || !reto) {
      setEnviando(false);
      setError(t("mfa.challengeError"));
      return;
    }
    const { error: errVerif } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: reto.id,
      code: codigo.trim(),
    });
    if (errVerif) {
      setEnviando(false);
      setCodigo("");
      setError(t("mfa.wrongCode"));
      return;
    }
    router.replace(destino);
    router.refresh();
  }

  if (fase === "cargando") return <p className="text-muted">{t("mfa.loading")}</p>;
  if (fase === "error") {
    return (
      <p role="alert" className="text-[var(--accent)]">
        {error}
      </p>
    );
  }

  return (
    <form onSubmit={confirmar}>
      <h1 className="text-2xl font-semibold tracking-tight">
        {fase === "enrolar" ? t("mfa.titleEnroll") : t("mfa.titleVerify")}
      </h1>

      {fase === "enrolar" ? (
        <>
          <p className="text-muted mt-3">{t("mfa.enrollIntro")}</p>
          {/* Data URL SVG generada por Supabase: next/image no aporta nada aquí. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qr}
            alt={t("mfa.qrAlt")}
            className="mx-auto mt-5 size-44 rounded-xl bg-white p-2"
          />
          <p className="text-muted mt-3 text-center text-xs">
            {t("mfa.manualKey")} <span className="text-ink break-all">{secreto}</span>
          </p>
        </>
      ) : (
        <p className="text-muted mt-3">{t("mfa.verifyIntro")}</p>
      )}

      <label htmlFor="codigo" className={`${labelCls} mt-6`}>
        {t("mfa.codeLabel")}
      </label>
      <input
        id="codigo"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        maxLength={6}
        required
        value={codigo}
        onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
        className={`${inputCls} text-center text-xl tracking-[0.4em]`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "mfa-error" : undefined}
      />
      {error ? (
        <p id="mfa-error" role="alert" className="mt-3 text-sm text-[var(--accent)]">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={enviando || codigo.length !== 6}
        className="btn-primary mt-5 w-full disabled:opacity-60"
      >
        {enviando
          ? t("mfa.checking")
          : fase === "enrolar"
            ? t("mfa.submitEnroll")
            : t("mfa.submitVerify")}
      </button>
    </form>
  );
}
