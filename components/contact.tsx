"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { CONTACT } from "@/lib/site";
import { Reveal, RevealGroup, RevealItem } from "./reveal";
import { enviarContacto, type ContactoEstado } from "@/lib/contact-action";
import { SERVICIOS_CONTACTO } from "@/lib/contact-validate";

/**
 * Fondo y color explícitos en cada <option>: el desplegable nativo (Chrome en Windows)
 * no hereda el fondo transparente del select y en modo oscuro salía blanco con texto claro.
 */
const OPTION = "bg-[var(--bg)] text-[var(--fg)]";

const INICIAL: ContactoEstado = { status: "idle" };

function ServiceSelect({ defaultValue }: { defaultValue: string }) {
  const { t } = useI18n();
  const [elegido, setElegido] = useState(defaultValue !== "");
  return (
    <select
      id="service"
      name="service"
      defaultValue={defaultValue}
      onChange={(e) => setElegido(e.target.value !== "")}
      className={`border-field w-full cursor-pointer appearance-none rounded-xl border bg-[var(--bg)] py-3 pr-10 pl-3.5 text-sm ${elegido ? "" : "text-[var(--muted)]"} transition-colors outline-none focus:border-[var(--accent)]`}
    >
      <option value="" className={OPTION}>
        {t("contact.formServicePh")}
      </option>
      {SERVICIOS_CONTACTO.map((o, i) => (
        <option key={o} value={o} className={OPTION}>
          {t(`contact.formServiceOpt${i + 1}`)}
        </option>
      ))}
    </select>
  );
}

export function Contact() {
  const { t, locale } = useI18n();
  // La acción corre en el servidor y funciona también sin JS (el formulario la usa como action).
  const [estado, formAction, enviando] = useActionState(enviarContacto, INICIAL);
  // Hora a la que se abrió el formulario: el servidor descarta envíos de menos de 3 s (bots).
  const [abiertoEn, setAbiertoEn] = useState("");
  useEffect(() => setAbiertoEn(String(Date.now())), []);
  const status = enviando ? "sending" : estado.status;
  // Un número nuevo por cada resultado, para rehacer el desplegable (ver ServiceSelect).
  const [visto, setVisto] = useState(estado);
  const [intento, setIntento] = useState(0);
  if (visto !== estado) {
    setVisto(estado);
    setIntento(intento + 1);
  }
  const v = estado.values;

  // Vías opcionales: solo salen si su dato está rellenado en CONTACT (lib/site.ts).
  const extra = [
    ...(CONTACT.bookingUrl
      ? [
          {
            href: CONTACT.bookingUrl,
            label: t("contact.bookingLabel"),
            value: t("contact.bookingValue"),
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            ),
          },
        ]
      : []),
    ...(CONTACT.whatsapp
      ? [
          {
            href: `https://wa.me/${CONTACT.whatsapp}`,
            label: t("contact.whatsappLabel"),
            value: `+${CONTACT.whatsapp}`,
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.7-5.2A8.5 8.5 0 1 1 21 11.5z" />
              </svg>
            ),
          },
        ]
      : []),
    ...(CONTACT.phone && CONTACT.phone !== CONTACT.whatsapp
      ? [
          {
            href: `tel:+${CONTACT.phone}`,
            label: t("contact.phoneLabel"),
            value: `+${CONTACT.phone}`,
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
              </svg>
            ),
          },
        ]
      : []),
  ];

  const links = [
    ...extra,
    {
      href: "mailto:tecnico@angel-fernandez.es",
      label: t("contact.emailLabel"),
      value: "tecnico@angel-fernandez.es",
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      href: "https://www.linkedin.com/in/angelfernandezgarriga",
      label: t("contact.linkedinLabel"),
      value: "in/angelfernandezgarriga",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
        </svg>
      ),
    },
    {
      href: "https://github.com/4ngel10",
      label: t("contact.githubLabel"),
      value: "github.com/4ngel10",
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      ),
    },
  ];

  return (
    <section id="contact" className="bg-paper-alt scroll-mt-[72px] py-24 md:py-28">
      <div className="mx-auto max-w-6xl px-6 md:px-8">
        <div className="grid grid-cols-1 items-start gap-14 md:gap-20 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <h2 className="text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-balance">
              {t("contact.title")}
            </h2>
            <p className="text-muted mt-5 mb-10 text-base leading-relaxed md:text-[17px]">
              {t("contact.lead")}
            </p>
            {CONTACT.availability[locale] && (
              <p className="text-muted -mt-6 mb-10 text-sm leading-relaxed">
                {CONTACT.availability[locale]}
              </p>
            )}
            <RevealGroup className="flex flex-col gap-3" stagger={0.08}>
              {links.map((l) => (
                <RevealItem key={l.href}>
                  <a
                    href={l.href}
                    {...(l.href.startsWith("http") && {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
                    className="group border-rule flex items-center gap-3.5 rounded-xl border p-4 transition-[border-color,transform] duration-200 hover:translate-x-1 hover:border-[var(--accent)]"
                    style={{ background: "var(--bg)" }}
                  >
                    <span className="bg-chip flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors duration-200 group-hover:bg-[var(--accent)] group-hover:text-white dark:group-hover:text-[#0a0f1c]">
                      {l.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-muted block text-xs font-medium">{l.label}</span>
                      <span className="text-ink block truncate text-sm font-medium">{l.value}</span>
                    </span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted shrink-0 transition-[transform,color] duration-200 group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                      aria-hidden
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </a>
                </RevealItem>
              ))}
            </RevealGroup>
          </Reveal>

          <Reveal delay={0.15}>
            <form
              action={formAction}
              className="border-rule rounded-2xl border p-6 md:p-8"
              style={{ background: "var(--bg)" }}
            >
              <input type="hidden" name="t" value={abiertoEn} />
              {/* Honeypot: fuera de pantalla y fuera del tabulador. Las personas no lo ven; los bots lo rellenan. */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <input type="text" name="web" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="mb-4">
                <label htmlFor="name" className="mb-1.5 block text-[13px] font-medium">
                  {t("contact.formName")}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={v?.name}
                  maxLength={100}
                  autoComplete="name"
                  required
                  placeholder={t("contact.formNamePh")}
                  className="border-field w-full rounded-xl border bg-transparent px-3.5 py-3 text-sm transition-colors outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="mb-1.5 block text-[13px] font-medium">
                  {t("contact.formEmail")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={v?.email}
                  maxLength={254}
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  required
                  placeholder={t("contact.formEmailPh")}
                  className="border-field w-full rounded-xl border bg-transparent px-3.5 py-3 text-sm transition-colors outline-none focus:border-[var(--accent)]"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="service" className="mb-1.5 block text-[13px] font-medium">
                  {t("contact.formService")}
                </label>
                <div className="relative">
                  {/* El valor va siempre en español, para que el correo a Ángel se lea igual
                      venga de la web en el idioma que venga. Con key se rehace tras cada envío
                      (React vacía el formulario) y el color del placeholder se reinicia. */}
                  <ServiceSelect key={intento} defaultValue={v?.service ?? ""} />
                  <svg
                    className="text-muted pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
              <div className="mb-5">
                <label htmlFor="message" className="mb-1.5 block text-[13px] font-medium">
                  {t("contact.formMessage")}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  defaultValue={v?.message}
                  minLength={5}
                  maxLength={4000}
                  required
                  placeholder={t("contact.formMessagePh")}
                  className="border-field min-h-[110px] w-full resize-y rounded-xl border bg-transparent px-3.5 py-3 text-sm transition-colors outline-none focus:border-[var(--accent)]"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending"}
                className="btn-primary w-full disabled:opacity-70"
              >
                {status === "sending" ? t("contact.formSending") : t("contact.formSubmit")}
                {status !== "sending" && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                )}
              </button>
              <p className="text-muted mt-3 text-[12px] leading-relaxed">
                {t("contact.formConsentPre")}
                <Link
                  href="/privacidad"
                  className="underline underline-offset-2 hover:text-[var(--fg)]"
                >
                  {t("contact.formConsentLink")}
                </Link>
                {t("contact.formConsentPost")}
              </p>
              {/* Región viva siempre presente: así el lector de pantalla anuncia el resultado
                  del envío cuando aparece el texto. */}
              <div role="status" aria-live="polite">
                {status === "ok" && (
                  <p className="mt-3 text-[13px] text-emerald-700 dark:text-emerald-400">
                    {t("contact.formOk")}
                  </p>
                )}
                {(status === "err" || status === "invalid") && (
                  <p className="mt-3 text-[13px] text-red-700 dark:text-red-400">
                    {t("contact.formErr")}
                  </p>
                )}
                {status === "limit" && (
                  <p className="mt-3 text-[13px] text-red-700 dark:text-red-400">
                    {t("contact.formLimit")}
                  </p>
                )}
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
