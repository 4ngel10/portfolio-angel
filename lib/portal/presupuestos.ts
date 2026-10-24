/** Cálculo y catálogo de los presupuestos. Código puro: se usa en servidor y en cliente. */

export const ESTADOS_PRESUPUESTO = ["borrador", "enviado", "aceptado", "rechazado"] as const;
export const TIPOS_IVA = [21, 10, 4, 0] as const;

const redondear = (n: number) => Math.round(n * 100) / 100;

export type LineaCalculo = { cantidad: number; precio_unitario: number };

/** Subtotal, descuento global, base imponible, IVA y total (redondeados a céntimos). */
export function totales(lineas: LineaCalculo[], descuentoPct: number, ivaPct: number) {
  const subtotal = redondear(lineas.reduce((s, l) => s + l.cantidad * l.precio_unitario, 0));
  const descuento = redondear((subtotal * descuentoPct) / 100);
  const base = redondear(subtotal - descuento);
  const iva = redondear((base * ivaPct) / 100);
  return { subtotal, descuento, base, iva, total: redondear(base + iva) };
}

/** Líneas de partida habituales. El precio se deja a cero: lo decide cada presupuesto. */
export const PLANTILLAS = [
  { clave: "web", unidad: "ud" },
  { clave: "landing", unidad: "ud" },
  { clave: "domain", unidad: "ud" },
  { clave: "support", unidad: "h" },
  { clave: "server", unidad: "ud" },
  { clave: "backup", unidad: "ud" },
  { clave: "network", unidad: "ud" },
  { clave: "migration", unidad: "ud" },
  { clave: "audit", unidad: "ud" },
  { clave: "hourBank", unidad: "ud" },
] as const;
