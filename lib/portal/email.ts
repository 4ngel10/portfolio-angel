import "server-only";
import { Resend } from "resend";
import { SITE_URL } from "@/lib/site";
import type { Prioridad } from "./types";

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

type NuevaIncidencia = {
  titulo: string;
  descripcion: string;
  prioridad: Prioridad;
  proyectoId: string;
  proyectoTitulo: string;
  empresaNombre: string;
};

/**
 * Avisa al admin de una incidencia nueva. Nunca lanza: si falta la configuración o
 * Resend falla, la incidencia ya está guardada y solo se deja constancia en el log.
 */
export async function avisarNuevaIncidencia(i: NuevaIncidencia): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  if (!apiKey || !to) {
    console.warn("[incidencias] Sin RESEND_API_KEY o ADMIN_EMAIL: no se envía el aviso.");
    return false;
  }

  const enlace = `${SITE_URL}/admin/proyectos/${i.proyectoId}`;
  const from = process.env.RESEND_FROM ?? "Portfolio <onboarding@resend.dev>";

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to,
      subject: `[Nueva incidencia] ${i.titulo} · ${i.empresaNombre}`.slice(0, 200),
      text: [
        `Empresa: ${i.empresaNombre}`,
        `Proyecto: ${i.proyectoTitulo}`,
        `Prioridad: ${i.prioridad}`,
        "",
        i.descripcion,
        "",
        enlace,
      ].join("\n"),
      html: `
        <p><strong>${escapeHtml(i.titulo)}</strong></p>
        <p>Empresa: ${escapeHtml(i.empresaNombre)}<br>
        Proyecto: ${escapeHtml(i.proyectoTitulo)}<br>
        Prioridad: ${escapeHtml(i.prioridad)}</p>
        <p style="white-space:pre-wrap">${escapeHtml(i.descripcion)}</p>
        <p><a href="${enlace}">Abrir el proyecto</a></p>`,
    });
    if (error) {
      console.error("[incidencias] Resend rechazó el aviso:", error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[incidencias] No se pudo enviar el aviso:", e);
    return false;
  }
}
