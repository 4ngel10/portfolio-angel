/**
 * Certificaciones que ha indicado Ángel, en un solo sitio: las pinta la tira de pruebas del hero
 * (components/proof-strip.tsx, solo el nombre) y salen en el JSON-LD del Person como hasCredential
 * (lib/seo.ts, nombre y emisor). Sin fechas ni enlaces hasta que los aporte.
 *
 * `issuer` es quien emite la certificación. Omada es el programa de formación de TP-Link.
 */
export const CERTIFICATIONS: { name: string; issuer: string }[] = [
  { name: "Omada OCNA Wireless", issuer: "TP-Link" },
  { name: "Hornetsecurity Certified Engineering Training", issuer: "Hornetsecurity" },
  { name: "3CX Basic Certified Engineer V20", issuer: "3CX" },
];
