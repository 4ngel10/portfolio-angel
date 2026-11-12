/**
 * Genera las variantes AVIF y WebP (con transparencia) del recorte de Sobre mí en public/sobre-mi/.
 *
 *   npx tsx scripts/generar-foto-sobre-mi.ts [ruta-del-recorte.webp] [--oscuro]
 *
 * Con --oscuro parte de public/angel-cutout-dark.webp y escribe public/sobre-mi/angel-oscuro-<ancho>.*
 * (foto del tema oscuro, se genera antes con scripts/recortar-foto-sobre-mi.ts --oscuro).
 *
 * Por defecto parte de public/angel-cutout.webp (520x1056). No amplía: el ancho máximo es el del
 * recorte. Sin metadatos EXIF y en sRGB. Los anchos están en lib/sobre-mi-foto.ts.
 */
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { ANCHOS_SOBRE_MI } from "../lib/sobre-mi-foto";

const OSCURO = process.argv.includes("--oscuro");

async function main(origen: string) {
  const destino = join(process.cwd(), "public", "sobre-mi");
  mkdirSync(destino, { recursive: true });
  const meta = await sharp(origen).metadata();
  if (!meta.width || !meta.height) throw new Error("No se pudo leer el recorte");
  console.log(
    `Recorte ${meta.width}x${meta.height}, transparencia: ${meta.hasAlpha ? "sí" : "no"}`,
  );
  const kb = (f: string) => (statSync(f).size / 1024).toFixed(1);
  for (const ancho of ANCHOS_SOBRE_MI) {
    if (ancho > meta.width)
      throw new Error(`El ancho ${ancho} supera el del recorte (${meta.width})`);
    const base = sharp(origen).toColorspace("srgb").resize({ width: ancho, kernel: "lanczos3" });
    const avif = join(destino, `angel-${OSCURO ? "oscuro-" : ""}${ancho}.avif`);
    const webp = join(destino, `angel-${OSCURO ? "oscuro-" : ""}${ancho}.webp`);
    await base.clone().avif({ quality: 60, effort: 6 }).toFile(avif);
    await base.clone().webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(webp);
    console.log(`  ${ancho}w  avif ${kb(avif)} KB  webp ${kb(webp)} KB`);
  }
}

const argOrigen = process.argv.slice(2).find((a) => !a.startsWith("--"));
const origen =
  argOrigen ??
  join(process.cwd(), "public", OSCURO ? "angel-cutout-dark.webp" : "angel-cutout.webp");
if (!existsSync(origen)) {
  console.error(`No encuentro ${origen}`);
  process.exit(1);
}
main(origen).catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
