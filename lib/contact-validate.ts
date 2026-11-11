/**
 * Validación y límite de uso del formulario de contacto (lógica pura, sin Node ni Next, para
 * poder probarla con `npm test`). La usa la server action lib/contact-action.ts.
 */

/** Valores del campo "service" tal como llegan en el correo (las etiquetas se traducen). */
export const SERVICIOS_CONTACTO = [
  "Administración de sistemas",
  "Desarrollo web",
  "Ambos",
  "Otro / No estoy seguro",
] as const;

/** Menos que esto entre que se abre la página y se envía solo lo hace un bot. */
export const TIEMPO_MINIMO_MS = 3000;

export type CampoContacto = "name" | "email" | "service" | "message";

export type DatosContacto = { name: string; email: string; service: string; message: string };

export type ResultadoValidacion =
  | { tipo: "ok"; datos: DatosContacto }
  | { tipo: "bot" }
  | { tipo: "invalido"; campo: CampoContacto };

const EMAIL = /^[^\s@]+@[^\s@]+[.][^\s@]{2,}$/;
// Sin saltos de línea ni caracteres de control en lo que va a cabeceras del correo.
const CONTROL = /[\u0000-\u001f\u007f]/;

/**
 * `campo` devuelve el texto de cada campo del formulario ("" si no existe).
 * - `web` es el honeypot: invisible para personas, lo rellenan los bots.
 * - `t` es la hora (ms) a la que la página abrió el formulario. Sin JS no existe y no se exige.
 */
export function validarContacto(campo: (k: string) => string, ahora: number): ResultadoValidacion {
  if (campo("web").trim() !== "") return { tipo: "bot" };
  const t = Number(campo("t"));
  if (campo("t") !== "" && Number.isFinite(t) && ahora - t < TIEMPO_MINIMO_MS)
    return { tipo: "bot" };

  const name = campo("name").trim();
  const email = campo("email").trim();
  const service = campo("service").trim();
  const message = campo("message").trim();

  if (name.length < 1 || name.length > 100 || CONTROL.test(name))
    return { tipo: "invalido", campo: "name" };
  if (email.length > 254 || CONTROL.test(email) || !EMAIL.test(email))
    return { tipo: "invalido", campo: "email" };
  if (service !== "" && !(SERVICIOS_CONTACTO as readonly string[]).includes(service)) {
    return { tipo: "invalido", campo: "service" };
  }
  if (message.length < 5 || message.length > 4000) return { tipo: "invalido", campo: "message" };
  return { tipo: "ok", datos: { name, email, service, message } };
}

/**
 * Límite de envíos por IP, en memoria. Es de mejor esfuerzo: cada instancia serverless tiene el
 * suyo y se reinicia con ella. Frena ráfagas; el tope real es la cuota de Resend y, si hace falta,
 * una regla de rate limit en el Firewall de Vercel.
 */
export function crearLimitador(
  opciones = { ventanaMs: 10 * 60_000, maxVentana: 3, maxHora: 8, maxGlobalHora: 40 },
) {
  const porIp = new Map<string, number[]>();
  let global: number[] = [];
  const HORA = 60 * 60_000;
  function permitir(ip: string, ahora: number): boolean {
    global = global.filter((t) => ahora - t < HORA);
    if (global.length >= opciones.maxGlobalHora) return false;
    // Evita que el mapa crezca sin límite.
    if (porIp.size > 2000) {
      for (const [k, v] of porIp) if (v.every((t) => ahora - t >= HORA)) porIp.delete(k);
    }
    const mios = (porIp.get(ip) ?? []).filter((t) => ahora - t < HORA);
    const enVentana = mios.filter((t) => ahora - t < opciones.ventanaMs).length;
    if (enVentana >= opciones.maxVentana || mios.length >= opciones.maxHora) {
      porIp.set(ip, mios);
      return false;
    }
    mios.push(ahora);
    porIp.set(ip, mios);
    global.push(ahora);
    return true;
  }
  /** Devuelve el cupo de un envío que acabó en error: un fallo de Resend no debe gastar uno de los 3. */
  function devolver(ip: string, ahora: number) {
    const lista = porIp.get(ip);
    const k = lista ? lista.lastIndexOf(ahora) : -1;
    if (lista && k >= 0) lista.splice(k, 1);
    const g = global.lastIndexOf(ahora);
    if (g >= 0) global.splice(g, 1);
  }
  return Object.assign(permitir, { devolver });
}
