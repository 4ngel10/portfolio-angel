/**
 * Catálogo y cálculo de Finanzas. Código puro: se usa en servidor y en cliente.
 *
 * Regla contable de todo el módulo: el ingreso se cuenta cuando se recibe un pago (criterio
 * de caja) y el gasto en su `fecha`. "Pendiente de cobro" es siempre el total vivo de los
 * cobros no anulados y sin pagar, sea cual sea el periodo elegido.
 */
import { redondear } from "./presupuestos";
import type {
  CategoriaGasto,
  Cobro,
  EstadoCobro,
  Gasto,
  Pago,
  Periodicidad,
  Suscripcion,
} from "./types";

export const METODOS_PAGO = [
  "transferencia",
  "bizum",
  "efectivo",
  "tarjeta",
  "paypal",
  "otro",
] as const;

export const CATEGORIAS_GASTO = [
  "software",
  "hosting",
  "dominios",
  "hardware",
  "formacion",
  "marketing",
  "oficina",
  "transporte",
  "servicios_profesionales",
  "comisiones",
  "otros",
] as const;

export const PERIODICIDADES = ["mensual", "trimestral", "anual"] as const;
export const ORIGENES_COBRO = ["presupuesto", "bolsa", "mantenimiento", "manual"] as const;

export const PLANES_COBRO = {
  completo: [100],
  mitad: [50, 50],
  tercios: [40, 30, 30],
} as const;

const enCentimos = (n: number) => Math.round(n * 100);

/** Hoy en Europa/Madrid como AAAA-MM-DD. Nunca `toISOString()`: de madrugada daría el día anterior. */
export function hoyMadrid(): string {
  return fechaMadrid(new Date());
}

/** Día (AAAA-MM-DD) de un instante, en hora de Madrid. */
export function fechaMadrid(instante: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(typeof instante === "string" ? new Date(instante) : instante);
}

/** AAAA-MM-DD que existe de verdad (rechaza 2026-02-30). */
export function esFecha(f: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(f)) return false;
  const { y, m, d } = partes(f);
  return m >= 1 && m <= 12 && d >= 1 && d <= ultimoDia(y, m);
}

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const partes = (f: string) => {
  const [y, m, d] = f.split("-").map(Number);
  return { y, m, d };
};
const ultimoDia = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate();

/** Importe escrito por una persona: "1.234,50" y "1234,5" valen; más de 2 decimales no. */
export function parseImporte(raw: string): number | null {
  const s = raw.trim().replace(/\s/g, "").replace(/€/g, "");
  let limpio: string;
  if (s.includes(",")) {
    if (!/^\d{1,3}(\.\d{3})*,\d{1,2}$/.test(s) && !/^\d+,\d{1,2}$/.test(s)) return null;
    limpio = s.replace(/\./g, "").replace(",", ".");
  } else if (/^\d+(\.\d{1,2})?$/.test(s)) {
    limpio = s;
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    limpio = s.replace(/\./g, "");
  } else {
    return null;
  }
  const n = Number(limpio);
  return Number.isFinite(n) ? n : null;
}

/** Días entre dos fechas AAAA-MM-DD (b menos a). */
export function diasEntre(a: string, b: string): number {
  const x = partes(a);
  const y = partes(b);
  return Math.round((Date.UTC(y.y, y.m - 1, y.d) - Date.UTC(x.y, x.m - 1, x.d)) / 86_400_000);
}

export function sumarDias(fecha: string, dias: number): string {
  const { y, m, d } = partes(fecha);
  const r = new Date(Date.UTC(y, m - 1, d + dias));
  return ymd(r.getUTCFullYear(), r.getUTCMonth() + 1, r.getUTCDate());
}

type CobroEstado = Pick<Cobro, "anulado" | "importe" | "fecha_vencimiento">;

/** El estado nunca se escribe a mano: sale de los pagos y de la fecha de vencimiento. */
export function estadoCobro(cobro: CobroEstado, pagado: number, hoy: string): EstadoCobro {
  if (cobro.anulado) return "anulado";
  const pendiente = enCentimos(cobro.importe) - enCentimos(pagado);
  if (pendiente <= 0) return "pagado";
  if (cobro.fecha_vencimiento && cobro.fecha_vencimiento < hoy) return "vencido";
  if (pagado > 0) return "parcial";
  return "pendiente";
}

export function resumenCobro(
  cobro: CobroEstado,
  pagos: Pick<Pago, "importe">[],
  hoy = hoyMadrid(),
) {
  const pagado = redondear(pagos.reduce((s, p) => s + p.importe, 0));
  const pendiente = Math.max(0, redondear(cobro.importe - pagado));
  return { pagado, pendiente, estado: estadoCobro(cobro, pagado, hoy) };
}

/**
 * Reparte un importe en plazos redondeados a céntimos. El último absorbe el redondeo para
 * que la suma sea exactamente `total`. Los porcentajes tienen que sumar 100.
 */
export function repartir(total: number, porcentajes: readonly number[]): number[] {
  const suma = porcentajes.reduce((s, p) => s + p, 0);
  if (porcentajes.length === 0 || Math.abs(suma - 100) > 0.001 || porcentajes.some((p) => p <= 0))
    throw new Error("Los porcentajes deben sumar 100");
  const totalCent = enCentimos(total);
  const plazos: number[] = [];
  let acumulado = 0;
  porcentajes.forEach((p, i) => {
    const cent =
      i === porcentajes.length - 1 ? totalCent - acumulado : Math.round((totalCent * p) / 100);
    acumulado += cent;
    plazos.push(cent / 100);
  });
  return plazos;
}

const MESES_POR_PERIODO = { mensual: 1, trimestral: 3, anual: 12 } as const;

/** Suma 1, 3 o 12 meses recortando al último día del mes (31 ene + 1 mes = 28/29 feb). */
export function avanzarRenovacion(fecha: string, periodicidad: Periodicidad): string {
  const { y, m, d } = partes(fecha);
  const total = y * 12 + (m - 1) + MESES_POR_PERIODO[periodicidad];
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return ymd(ny, nm, Math.min(d, ultimoDia(ny, nm)));
}

export const costeMensual = (s: Pick<Suscripcion, "importe" | "periodicidad">) =>
  redondear(s.importe / MESES_POR_PERIODO[s.periodicidad]);

export const costeAnual = (s: Pick<Suscripcion, "importe" | "periodicidad">) =>
  redondear((s.importe / MESES_POR_PERIODO[s.periodicidad]) * 12);

export const PERIODOS = ["mes", "trimestre", "anio", "ultimos12"] as const;
export type ClavePeriodo = (typeof PERIODOS)[number];

export function rangoPeriodo(clave: ClavePeriodo, hoy: string): { desde: string; hasta: string } {
  const { y, m } = partes(hoy);
  if (clave === "mes") return { desde: ymd(y, m, 1), hasta: ymd(y, m, ultimoDia(y, m)) };
  if (clave === "trimestre") {
    const inicio = Math.floor((m - 1) / 3) * 3 + 1;
    return { desde: ymd(y, inicio, 1), hasta: ymd(y, inicio + 2, ultimoDia(y, inicio + 2)) };
  }
  if (clave === "anio") return { desde: ymd(y, 1, 1), hasta: ymd(y, 12, 31) };
  const total = y * 12 + (m - 1) - 11;
  return {
    desde: ymd(Math.floor(total / 12), (total % 12) + 1, 1),
    hasta: ymd(y, m, ultimoDia(y, m)),
  };
}

/** Últimos 12 meses (el actual incluido); los meses sin movimiento salen a cero. */
export function serieMensual(
  pagos: Pick<Pago, "fecha" | "importe">[],
  gastos: Pick<Gasto, "fecha" | "importe">[],
  hoy: string,
): { mes: string; ingresos: number; gastos: number }[] {
  const { y, m } = partes(hoy);
  const serie = Array.from({ length: 12 }, (_, i) => {
    const total = y * 12 + (m - 1) - (11 - i);
    return { mes: `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`, ingresos: 0, gastos: 0 };
  });
  const porMes = new Map(serie.map((s) => [s.mes, s]));
  for (const p of pagos) {
    const fila = porMes.get(p.fecha.slice(0, 7));
    if (fila) fila.ingresos = redondear(fila.ingresos + p.importe);
  }
  for (const g of gastos) {
    const fila = porMes.get(g.fecha.slice(0, 7));
    if (fila) fila.gastos = redondear(fila.gastos + g.importe);
  }
  return serie;
}

export function porCategoria(
  gastos: Pick<Gasto, "categoria" | "importe">[],
): { categoria: CategoriaGasto; total: number }[] {
  const totales = new Map<CategoriaGasto, number>();
  for (const g of gastos) totales.set(g.categoria, (totales.get(g.categoria) ?? 0) + g.importe);
  return [...totales]
    .map(([categoria, total]) => ({ categoria, total: redondear(total) }))
    .sort((a, b) => b.total - a.total);
}

export type ColumnaCsv = { clave: string; titulo: string };

/**
 * CSV para Excel en español: separador ";", coma decimal, CRLF y BOM UTF-8. Los textos que
 * empiezan por = + - @ llevan una comilla delante para que Excel no los ejecute como fórmula.
 */
export function aCsv(filas: Record<string, string | number | null>[], columnas: ColumnaCsv[]) {
  const celda = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return "";
    let s = typeof v === "number" ? v.toFixed(2).replace(".", ",") : v;
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lineas = [
    columnas.map((c) => celda(c.titulo)).join(";"),
    ...filas.map((f) => columnas.map((c) => celda(f[c.clave])).join(";")),
  ];
  return `﻿${lineas.join("\r\n")}\r\n`;
}
