import "server-only";
import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";
import type { Prioridad } from "./types";

const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

type Aviso = {
  asunto: string;
  /** Líneas de contexto (empresa, proyecto...), una por renglón. */
  datos: string[];
  /** Texto libre opcional (descripción, mensaje...). */
  cuerpo?: string;
  /** Ruta dentro de la web, p. ej. "/admin/proyectos/123". */
  ruta: string;
  etiqueta: string;
};

/**
 * Avisa al admin de algo que ha hecho un cliente. Nunca lanza: si falta la configuración o
 * Resend falla, la acción ya está guardada y solo se deja constancia en el log.
 */
export async function avisarAdmin(a: Aviso): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!apiKey || !to) {
    console.warn("[aviso] Sin RESEND_API_KEY o ADMIN_EMAIL: no se envía el aviso.");
    return false;
  }

  const enlace = `${SITE_URL}${a.ruta}`;
  const from = process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>";

  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to,
      subject: a.asunto.slice(0, 200),
      text: [...a.datos, ...(a.cuerpo ? ["", a.cuerpo] : []), "", enlace].join("\n"),
      html: `
        <p><strong>${escapeHtml(a.asunto)}</strong></p>
        <p>${a.datos.map(escapeHtml).join("<br>")}</p>
        ${a.cuerpo ? `<p style="white-space:pre-wrap">${escapeHtml(a.cuerpo)}</p>` : ""}
        <p><a href="${enlace}">${escapeHtml(a.etiqueta)}</a></p>`,
    });
    if (error) {
      console.error("[aviso] Resend rechazó el aviso:", error.message);
      return false;
    }
    console.info(`[aviso] Enviado a Resend (id ${data?.id}): ${a.asunto}`);
    return true;
  } catch (e) {
    console.error("[aviso] No se pudo enviar el aviso:", e);
    return false;
  }
}

type NuevaIncidencia = {
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  proyectoId: string;
  proyectoTitulo: string;
  empresaNombre: string;
};

export function avisarNuevaIncidencia(i: NuevaIncidencia) {
  return avisarAdmin({
    asunto: `[Nueva incidencia] ${i.titulo} · ${i.empresaNombre}`,
    datos: [
      `Empresa: ${i.empresaNombre}`,
      `Proyecto: ${i.proyectoTitulo}`,
      `Prioridad: ${i.prioridad}`,
    ],
    cuerpo: i.descripcion,
    ruta: `/admin/proyectos/${i.proyectoId}`,
    etiqueta: "Abrir el proyecto",
  });
}

type AvisoCliente = {
  /** Enlace completo; si falta, se usa SITE_URL + ruta. */
  url?: string;
  /** Destinatario (un correo por persona, para no mostrar las direcciones de las demás). */
  to: string;
  asunto: string;
  datos: string[];
  ruta: string;
  etiqueta: string;
};

/** Mismo diseño que avisarAdmin, pero hacia una persona de una empresa cliente. Nunca lanza. */
export async function avisarCliente(a: AvisoCliente): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[aviso] Sin RESEND_API_KEY: no se envía el aviso al cliente.");
    return false;
  }
  const enlace = a.url ?? `${SITE_URL}${a.ruta}`;
  const from = process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>";
  try {
    const { data, error } = await new Resend(apiKey).emails.send({
      from,
      to: a.to,
      subject: a.asunto.slice(0, 200),
      text: [...a.datos, "", enlace].join("\n"),
      html: `
        <p><strong>${escapeHtml(a.asunto)}</strong></p>
        <p>${a.datos.map(escapeHtml).join("<br>")}</p>
        <p><a href="${enlace}">${escapeHtml(a.etiqueta)}</a></p>`,
    });
    if (error) {
      console.error("[aviso] Resend rechazó el aviso al cliente:", error.message);
      return false;
    }
    console.info(`[aviso] Enviado a Resend (id ${data?.id}): ${a.asunto}`);
    return true;
  } catch (e) {
    console.error("[aviso] No se pudo enviar el aviso al cliente:", e);
    return false;
  }
}

const TEXTOS_BOLSA = {
  es: {
    asunto: "Te quedan pocas horas en tu bolsa",
    intro: (empresa: string) => `La bolsa de horas de ${empresa} está llegando a su fin.`,
    quedan: (restantes: string, total: string) => `Quedan ${restantes} de ${total} contratadas.`,
    etiqueta: "Ver mi bolsa de horas",
  },
  en: {
    asunto: "You are running low on hours",
    intro: (empresa: string) => `The hour bank of ${empresa} is running low.`,
    quedan: (restantes: string, total: string) => `${restantes} left of ${total} contracted.`,
    etiqueta: "View my hour bank",
  },
};

/**
 * Avisa a las personas de una empresa de que su bolsa está al 20 % o menos. Devuelve true si
 * al menos un correo salió. Cada correo va en el idioma de la persona.
 */
export async function avisarBolsaBaja(p: {
  destinatarios: { email: string; locale?: "es" | "en" }[];
  empresa: string;
  restantes: number;
  contratadas: number;
}): Promise<boolean> {
  const resultados = await Promise.all(
    p.destinatarios.map((d) => {
      const locale = d.locale ?? "es";
      const x = TEXTOS_BOLSA[locale];
      const fmt = (n: number) =>
        `${n.toLocaleString(locale === "es" ? "es-ES" : "en-GB", { maximumFractionDigits: 2 })} h`;
      return avisarCliente({
        to: d.email,
        asunto: x.asunto,
        datos: [x.intro(p.empresa), x.quedan(fmt(p.restantes), fmt(p.contratadas))],
        ruta: "/portal/horas",
        etiqueta: x.etiqueta,
      });
    }),
  );
  return resultados.some(Boolean);
}

const TEXTOS_INVITACION = {
  es: {
    asunto: "Ya tienes acceso a tu área de cliente",
    hola: (nombre: string) => `Hola ${nombre}.`,
    alta: (empresa: string) => `Te hemos dado de alta en el área de cliente de ${empresa}.`,
    enlace:
      "Con este enlace entras y eliges tu contraseña. Caduca pasado un tiempo: si no funciona, pide otro desde la pantalla de acceso.",
    etiqueta: "Entrar a mi área de cliente",
  },
  en: {
    asunto: "You now have access to your client area",
    hola: (nombre: string) => `Hi ${nombre}.`,
    alta: (empresa: string) => `You have been added to the client area of ${empresa}.`,
    enlace:
      "Use this link to sign in and choose your password. It expires after a while: if it does not work, request another one from the sign-in page.",
    etiqueta: "Go to my client area",
  },
};

/** Correo de bienvenida con el enlace de acceso, en el idioma de la persona. */
export function enviarInvitacion(p: {
  to: string;
  nombre: string;
  empresa: string;
  enlace: string;
  locale?: "es" | "en";
}): Promise<boolean> {
  const x = TEXTOS_INVITACION[p.locale ?? "es"];
  return avisarCliente({
    to: p.to,
    asunto: x.asunto,
    datos: [x.hola(p.nombre), x.alta(p.empresa), x.enlace],
    ruta: "/portal",
    url: p.enlace,
    etiqueta: x.etiqueta,
  });
}
