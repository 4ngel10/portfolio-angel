// OJO con las barras invertidas: \d, \s y \w deben llevar su "\" (sin ella la regex busca la
// letra suelta y rechaza todo). Las regex de fecha viven aquí para no repetirlas por el código.
/** Fecha AAAA-MM-DD (solo el formato; para saber si existe, `esFecha` en finanzas.ts). */
export const FECHA = /^\d{4}-\d{2}-\d{2}$/;
/** Mes AAAA-MM. */
export const MES = /^\d{4}-(0[1-9]|1[0-2])$/;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isUuid = (v: unknown): v is string => typeof v === "string" && UUID.test(v);
export const isEmail = (v: unknown): v is string =>
  typeof v === "string" && v.length <= 254 && EMAIL.test(v);

/** Texto recortado de un FormData. Devuelve "" si no es un string. */
export function text(fd: FormData, key: string, max = 500): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function oneOf<T extends string>(v: unknown, allowed: readonly T[]): T | null {
  return typeof v === "string" && (allowed as readonly string[]).includes(v) ? (v as T) : null;
}

export type FormState = {
  ok?: boolean;
  error?: string;
  message?: string;
  /** Empresa recién creada: el formulario la usa para pedir sus datos básicos. */
  empresa?: { id: string; nombre: string };
};

export function slugify(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
