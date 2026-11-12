"use server";

import "server-only";
import { Resend } from "resend";
import { LEGAL } from "./site";
import { ipDelCliente } from "./portal/ip";
import {
  crearLimitador,
  validarContacto,
  type CampoContacto,
  type DatosContacto,
} from "./contact-validate";

export type ContactoEstado = {
  status: "idle" | "ok" | "err" | "invalid" | "limit";
  /** Lo que escribió la persona, para no perderlo si el envío falla (React vacía el formulario). */
  values?: DatosContacto;
  /** Con status "invalid": el primer campo con error, para marcarlo y llevar el foco. */
  campo?: CampoContacto;
};

const permitir = crearLimitador();

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

/**
 * Envía el formulario de contacto por Resend a Ángel, con reply-to al correo del visitante.
 * Funciona sin JS (el formulario usa esta acción como `action`). Nunca registra el mensaje ni el
 * correo de la persona en los logs.
 *
 * Variables de entorno: RESEND_API_KEY, CONTACT_FROM (o RESEND_FROM) con un remitente de un dominio
 * verificado en Resend, y opcionalmente CONTACT_TO (por defecto LEGAL.email).
 */
export async function enviarContacto(
  _previo: ContactoEstado,
  form: FormData,
): Promise<ContactoEstado> {
  const campo = (k: string) => {
    const v = form.get(k);
    return typeof v === "string" ? v : "";
  };
  const valores: DatosContacto = {
    name: campo("name").slice(0, 100),
    email: campo("email").slice(0, 254),
    service: campo("service").slice(0, 60),
    message: campo("message").slice(0, 4000),
  };

  const r = validarContacto(campo, Date.now());
  // A un bot se le contesta "enviado" para no darle pistas, pero no se manda nada.
  if (r.tipo === "bot") return { status: "ok" };
  if (r.tipo === "invalido") return { status: "invalid", campo: r.campo, values: valores };

  const ip = (await ipDelCliente()) ?? "desconocida";
  const ahora = Date.now();
  if (!permitir(ip, ahora)) return { status: "limit", values: valores };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM ?? process.env.RESEND_FROM;
  const to = process.env.CONTACT_TO ?? LEGAL.email;
  if (!apiKey || !from) {
    console.error("[contacto] Falta RESEND_API_KEY o CONTACT_FROM: no se puede enviar.");
    permitir.devolver(ip, ahora);
    return { status: "err", values: valores };
  }

  const { name, email, service, message } = r.datos;
  const subject = `Nuevo mensaje del portfolio: ${name}${service ? ` (${service})` : ""}`.slice(
    0,
    150,
  );
  const lineas = [`Nombre: ${name}`, `Email: ${email}`, `Servicio: ${service || "Sin indicar"}`];
  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to,
      replyTo: email,
      subject,
      text: [...lineas, "", message].join("\n"),
      html: `<p>${lineas.map(escapeHtml).join("<br>")}</p><p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
    if (error) {
      console.error("[contacto] Resend rechazó el envío:", error.message);
      permitir.devolver(ip, ahora);
      return { status: "err", values: valores };
    }
    console.info(`[contacto] Enviado (Resend ${data?.id}).`);
    return { status: "ok" };
  } catch (e) {
    console.error(
      "[contacto] No se pudo contactar con Resend:",
      e instanceof Error ? e.message : e,
    );
    permitir.devolver(ip, ahora);
    return { status: "err", values: valores };
  }
}
