import "server-only";
import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";
import type { Prioridad } from "./types";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

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
    const { error } = await new Resend(apiKey).emails.send({
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
    datos: [`Empresa: ${i.empresaNombre}`, `Proyecto: ${i.proyectoTitulo}`, `Prioridad: ${i.prioridad}`],
    cuerpo: i.descripcion,
    ruta: `/admin/proyectos/${i.proyectoId}`,
    etiqueta: "Abrir el proyecto",
  });
}
