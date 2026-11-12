import { NextResponse } from "next/server";
import { crearLimitador } from "@/lib/contact-validate";
import { ipDelCliente } from "@/lib/portal/ip";

/**
 * Receptor de informes de la CSP (Report-Only). Acepta los dos formatos:
 * - report-uri: `application/csp-report`, un objeto `{ "csp-report": {...} }`.
 * - report-to (Reporting API): `application/reports+json`, una lista de `{ type, body }`.
 * Solo escribe en los logs de Vercel (busca `[csp-report]`): sin base de datos y sin IP ni
 * user agent. Cuerpo máximo de 8 KB, hasta 10 informes por petición y límite de frecuencia.
 */
export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024;
const MAX_INFORMES = 10;
// Por IP: 20 por minuto y 300 por hora. Tope global por instancia: 2000 por hora.
const permitir = crearLimitador({
  ventanaMs: 60_000,
  maxVentana: 20,
  maxHora: 300,
  maxGlobalHora: 2000,
});

const respuesta = (status: number) =>
  new NextResponse(null, { status, headers: { "Cache-Control": "no-store" } });

/** Lee el cuerpo y corta si pasa del máximo (el Content-Length puede faltar o mentir). */
async function leerAcotado(req: Request): Promise<string | null> {
  const declarado = Number(req.headers.get("content-length"));
  if (Number.isFinite(declarado) && declarado > MAX_BYTES) return null;
  const lector = req.body?.getReader();
  if (!lector) return "";
  const trozos: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await lector.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await lector.cancel();
      return null;
    }
    trozos.push(value);
  }
  return Buffer.concat(trozos).toString("utf8");
}

/** Texto acotado y, si es una URL, sin parámetros ni fragmento (pueden llevar datos de la persona). */
function limpio(v: unknown, max = 200): string {
  if (typeof v !== "string") return "";
  let s = v;
  if (/^https?:[/][/]/.test(s)) {
    try {
      const u = new URL(s);
      s = u.origin + u.pathname;
    } catch {}
  }
  return s.slice(0, max);
}

type Informe = {
  doc: string;
  directiva: string;
  bloqueado: string;
  modo: string;
  archivo: string;
  linea: number;
};

function normalizar(x: unknown): Informe | null {
  if (typeof x !== "object" || x === null) return null;
  const o = x as Record<string, unknown>;
  // report-to: { type: "csp-violation", body: {...} }; report-uri: el objeto ya es el cuerpo.
  const b = (typeof o.body === "object" && o.body !== null ? o.body : o) as Record<string, unknown>;
  if (o.type !== undefined && o.type !== "csp-violation") return null;
  const directiva = limpio(
    b.effectiveDirective ?? b["effective-directive"] ?? b["violated-directive"],
    60,
  );
  if (!directiva) return null;
  return {
    doc: limpio(b.documentURL ?? b["document-uri"]),
    directiva,
    bloqueado: limpio(b.blockedURL ?? b["blocked-uri"]),
    modo: limpio(b.disposition, 12),
    archivo: limpio(b.sourceFile ?? b["source-file"]),
    linea: Number(b.lineNumber ?? b["line-number"]) || 0,
  };
}

export async function POST(req: Request) {
  const tipo = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (!["application/csp-report", "application/reports+json", "application/json"].includes(tipo)) {
    return respuesta(415);
  }
  const ip = (await ipDelCliente()) ?? "desconocida";
  if (!permitir(ip, Date.now())) return respuesta(429);

  const texto = await leerAcotado(req);
  if (texto === null) return respuesta(413);

  let datos: unknown;
  try {
    datos = JSON.parse(texto);
  } catch {
    return respuesta(400);
  }
  const lista = Array.isArray(datos)
    ? datos
    : typeof datos === "object" && datos !== null && "csp-report" in datos
      ? [(datos as Record<string, unknown>)["csp-report"]]
      : [datos];
  const informes = lista
    .slice(0, MAX_INFORMES)
    .map(normalizar)
    .filter((i): i is Informe => i !== null);
  for (const i of informes) console.warn("[csp-report]", JSON.stringify(i));
  return respuesta(204);
}
