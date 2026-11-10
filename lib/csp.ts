import { createHash } from "node:crypto";
import { THEME_SCRIPT } from "./theme-script";

/** Rutas con sesión o formularios de acceso: dinámicas, con nonce (las sirve proxy.ts). */
export const RUTAS_PRIVADAS = ["admin", "portal", "login", "mfa", "contrasena", "auth"] as const;

const isDev = process.env.NODE_ENV === "development";

/** Origen de Supabase (API, Auth y subidas directas a Storage), sacado de la variable de entorno. */
function origenSupabase(): string | null {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return null;
  }
}

const hashDelTema = `'sha256-${createHash("sha256").update(THEME_SCRIPT).digest("base64")}'`;

/** Directivas comunes. Solo cambia script-src según la ruta. */
function directivas(scriptSrc: string): string {
  const supabase = origenSupabase();
  const connect = ["'self'", supabase, "https://api.web3forms.com"].filter(Boolean).join(" ");
  return [
    "default-src 'self'",
    `script-src ${scriptSrc}${isDev ? " 'unsafe-eval'" : ""}`,
    `connect-src ${connect}`,
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "style-src 'self' 'unsafe-inline'",
    "form-action 'self' https://api.web3forms.com",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    // upgrade-insecure-requests se ignora en Report-Only (el navegador avisa). Añadirlo al pasar a enforce.
  ].join("; ");
}

/** Web pública (estática): sin nonce, así que los scripts en línea de Next y el del tema van con 'unsafe-inline'. */
export const cspPublica = () => directivas("'self' 'unsafe-inline'");

/** Rutas privadas (dinámicas): nonce por petición. El script del tema, que no lleva nonce, entra por hash. */
export const cspPrivada = (nonce: string) =>
  directivas(`'self' 'nonce-${nonce}' 'strict-dynamic' ${hashDelTema}`);
