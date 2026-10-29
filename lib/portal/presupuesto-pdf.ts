import "server-only";
import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import { LEGAL } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { getI18n } from "./i18n";
import { totales } from "./presupuestos";
import { listarLineasPresupuesto } from "./queries";
import type { PortalT } from "./translate";
import type { Empresa, Presupuesto, PresupuestoLinea } from "./types";

type Formato = {
  t: PortalT;
  fecha: (iso: string | null | undefined) => string;
  fechaHora: (iso: string | null | undefined) => string;
  euros: (n: number) => string;
};

const A4 = { w: 595.28, h: 841.89 };
const MARGEN = 48;
const INK = rgb(0.1, 0.11, 0.13);
const MUTED = rgb(0.42, 0.44, 0.48);
const RULE = rgb(0.85, 0.85, 0.87);
const ACCENT = rgb(0.76, 0.25, 0.05);

/**
 * Las fuentes estándar del PDF solo codifican WinAnsi: lo que no entra (emojis, comillas raras)
 * se cambia por "?" en lugar de romper la generación. Los saltos y espacios raros se normalizan.
 */
function limpiar(texto: string, font: PDFFont): string {
  const soportado = new Set(font.getCharacterSet());
  return Array.from(texto.replace(/[  ]/g, " ").replace(/\t/g, " "))
    .map((c) => (soportado.has(c.codePointAt(0)!) ? c : "?"))
    .join("");
}

/** Parte un texto en líneas que caben en `ancho`, respetando los saltos de línea originales. */
function envolver(texto: string, font: PDFFont, size: number, ancho: number): string[] {
  const lineas: string[] = [];
  for (const parrafo of limpiar(texto, font).split(/\r?\n/)) {
    let actual = "";
    for (const palabra of parrafo.split(" ")) {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (!actual || font.widthOfTextAtSize(prueba, size) <= ancho) {
        actual = prueba;
      } else {
        lineas.push(actual);
        actual = palabra;
      }
    }
    lineas.push(actual);
  }
  return lineas;
}

/** Nombre de archivo seguro para la cabecera Content-Disposition. */
export function nombrePdf(numero: string): string {
  return `presupuesto-${numero.replace(/[^A-Za-z0-9._-]+/g, "-")}.pdf`;
}

/** Genera el PDF de un presupuesto: cabecera, líneas, totales, notas y firma. */
export async function generarPresupuestoPdf({
  presupuesto,
  lineas,
  empresa,
  formato,
}: {
  presupuesto: Presupuesto;
  lineas: PresupuestoLinea[];
  empresa?: Empresa | null;
  formato: Formato;
}): Promise<Uint8Array> {
  const { t, fecha, fechaHora, euros } = formato;
  const calculo = totales(lineas, presupuesto.descuento, presupuesto.iva);

  const pdf = await PDFDocument.create();
  pdf.setTitle(`${presupuesto.numero} ${presupuesto.titulo}`);
  pdf.setAuthor(LEGAL.nombre);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const cursiva = await pdf.embedFont(StandardFonts.HelveticaOblique);

  let page = pdf.addPage([A4.w, A4.h]);
  let y = A4.h - MARGEN;
  const derecha = A4.w - MARGEN;
  const ancho = derecha - MARGEN;

  const texto = (
    s: string,
    x: number,
    opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb> } = {},
  ) => {
    const font = opts.font ?? regular;
    page.drawText(limpiar(s, font), {
      x,
      y,
      size: opts.size ?? 10,
      font,
      color: opts.color ?? INK,
    });
  };
  /** Texto alineado a la derecha, terminando en `x`. */
  const textoDer = (s: string, x: number, opts: Parameters<typeof texto>[2] = {}) => {
    const font = opts.font ?? regular;
    const limpio = limpiar(s, font);
    texto(limpio, x - font.widthOfTextAtSize(limpio, opts.size ?? 10), opts);
  };
  const linea = (x1: number, x2: number, grosor = 0.75) =>
    page.drawLine({
      start: { x: x1, y },
      end: { x: x2, y },
      thickness: grosor,
      color: RULE,
    });
  const asegurar = (alto: number) => {
    if (y - alto >= MARGEN) return;
    page = pdf.addPage([A4.w, A4.h]);
    y = A4.h - MARGEN;
  };

  // Emisor y número
  texto(LEGAL.nombre, MARGEN, { font: bold, size: 12 });
  textoDer(presupuesto.numero, derecha, { font: bold, size: 12, color: ACCENT });
  y -= 14;
  texto(`NIF ${LEGAL.nif}`, MARGEN, { size: 9, color: MUTED });
  textoDer(t(`quotes.status.${presupuesto.estado}`), derecha, { size: 9, color: MUTED });
  y -= 12;
  texto(LEGAL.email, MARGEN, { size: 9, color: MUTED });
  y -= 12;
  texto(LEGAL.domicilio, MARGEN, { size: 9, color: MUTED });
  y -= 22;
  linea(MARGEN, derecha);
  y -= 26;

  // Título y cliente
  for (const l of envolver(presupuesto.titulo, bold, 16, ancho)) {
    asegurar(20);
    texto(l, MARGEN, { font: bold, size: 16 });
    y -= 20;
  }
  if (empresa) {
    texto(empresa.nombre, MARGEN, { size: 11, color: MUTED });
    y -= 16;
  }
  y -= 6;

  // Fechas
  texto(t("quotes.issueDate"), MARGEN, { size: 9, color: MUTED });
  const colValido = MARGEN + 160;
  if (presupuesto.valido_hasta) texto(t("quotes.validUntil"), colValido, { size: 9, color: MUTED });
  y -= 13;
  texto(fecha(presupuesto.fecha_emision), MARGEN, { font: bold });
  if (presupuesto.valido_hasta) texto(fecha(presupuesto.valido_hasta), colValido, { font: bold });
  y -= 28;

  // Tabla de líneas
  const colCant = MARGEN + ancho * 0.58;
  const colPrecio = MARGEN + ancho * 0.78;
  const anchoConcepto = colCant - MARGEN - 40;
  const cabeceraTabla = () => {
    texto(t("quotes.concept"), MARGEN, { font: bold, size: 9, color: MUTED });
    textoDer(t("quotes.quantity"), colCant + 40, { font: bold, size: 9, color: MUTED });
    textoDer(t("quotes.unitPrice"), colPrecio + 50, { font: bold, size: 9, color: MUTED });
    textoDer(t("quotes.lineTotal"), derecha, { font: bold, size: 9, color: MUTED });
    y -= 8;
    linea(MARGEN, derecha);
    y -= 16;
  };
  cabeceraTabla();

  for (const l of lineas) {
    const concepto = envolver(l.concepto, bold, 10, anchoConcepto);
    const detalle = l.detalle ? envolver(l.detalle, regular, 9, anchoConcepto) : [];
    const alto = concepto.length * 13 + detalle.length * 12 + 10;
    if (y - alto < MARGEN) {
      asegurar(Infinity);
      cabeceraTabla();
    }
    const arriba = y;
    concepto.forEach((c) => {
      texto(c, MARGEN, { font: bold });
      y -= 13;
    });
    detalle.forEach((d) => {
      texto(d, MARGEN, { size: 9, color: MUTED });
      y -= 12;
    });
    const abajo = y;
    y = arriba;
    textoDer(String(l.cantidad), colCant + 40);
    textoDer(euros(l.precio_unitario), colPrecio + 50);
    textoDer(euros(l.cantidad * l.precio_unitario), derecha);
    y = abajo - 4;
    linea(MARGEN, derecha, 0.5);
    y -= 14;
  }

  // Totales
  asegurar(110);
  y -= 4;
  const xEtiqueta = MARGEN + ancho * 0.58;
  const fila = (etiqueta: string, valor: string, opts: { grande?: boolean } = {}) => {
    const size = opts.grande ? 13 : 10;
    const font = opts.grande ? bold : regular;
    texto(etiqueta, xEtiqueta, { size, font, color: opts.grande ? INK : MUTED });
    textoDer(valor, derecha, { size, font });
    y -= opts.grande ? 18 : 15;
  };
  fila(t("quotes.subtotal"), euros(calculo.subtotal));
  if (calculo.descuento > 0) {
    fila(t("quotes.discountLine", { pct: presupuesto.descuento }), `-${euros(calculo.descuento)}`);
  }
  fila(t("quotes.taxBase"), euros(calculo.base));
  fila(t("quotes.vatLine", { pct: presupuesto.iva }), euros(calculo.iva));
  y -= 2;
  linea(xEtiqueta, derecha);
  y -= 16;
  fila(t("quotes.total"), euros(calculo.total), { grande: true });

  // Notas
  if (presupuesto.notas) {
    y -= 14;
    asegurar(40);
    texto(t("quotes.notes"), MARGEN, { font: bold, size: 10 });
    y -= 15;
    for (const l of envolver(presupuesto.notas, regular, 9.5, ancho)) {
      asegurar(14);
      texto(l, MARGEN, { size: 9.5, color: MUTED });
      y -= 13;
    }
  }

  // Firma
  if (presupuesto.firma_nombre && presupuesto.firma_fecha) {
    y -= 18;
    asegurar(70);
    linea(MARGEN, derecha);
    y -= 18;
    texto(t("quotes.signedTitle"), MARGEN, { font: bold, size: 10 });
    y -= 20;
    texto(presupuesto.firma_nombre, MARGEN, { font: cursiva, size: 15 });
    y -= 15;
    texto(t("quotes.signedOn", { date: fechaHora(presupuesto.firma_fecha) }), MARGEN, {
      size: 9,
      color: MUTED,
    });
  }

  return pdf.save();
}

/**
 * Respuesta HTTP con el PDF de un presupuesto. La sesión (admin o cliente) ya la ha comprobado
 * la ruta; el acceso a los datos lo limita RLS, así que un cliente no obtiene borradores ni
 * presupuestos de otra empresa (404).
 */
export async function respuestaPdf(id: string): Promise<Response> {
  const supabase = await createClient();
  const { data } = await supabase.from("presupuestos").select("*").eq("id", id).maybeSingle();
  const presupuesto = data as Presupuesto | null;
  if (!presupuesto) return Response.json({ error: "No encontrado" }, { status: 404 });

  const [lineas, { data: emp }, i18n] = await Promise.all([
    listarLineasPresupuesto([id]),
    supabase.from("empresas").select("*").eq("id", presupuesto.empresa_id).maybeSingle(),
    getI18n(),
  ]);
  const pdf = await generarPresupuestoPdf({
    presupuesto,
    lineas,
    empresa: emp as Empresa | null,
    formato: i18n,
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${nombrePdf(presupuesto.numero)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
