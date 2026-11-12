/**
 * Genera las variantes AVIF y WebP de la foto apaisada del hero para móvil en public/hero-movil/.
 *
 *   npx tsx scripts/generar-foto-hero-movil.ts [ruta-del-original]
 *
 * El original (JPG de cámara) va en `originales/movil/hero-movil.jpg` (ignorada por git), nunca en
 * `public/`. Recorte 3:2: quita el 18 % izquierdo (la silla desenfocada) y empieza al 5 % de la
 * altura, así quedan el pelo con margen arriba y la mano y el reloj abajo.
 */
import { existsSync, mkdirSync, statSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import sharp from "sharp";
import { ANCHOS_FOTO_MOVIL, RATIO_FOTO_MOVIL } from "../lib/hero-foto-movil";

const IZQUIERDA = 0.08;
const ANCHO = 0.82;
const TOP = 0.05;

async function main(origen: string) {
  const destino = join(process.cwd(), "public", "hero-movil");
  mkdirSync(destino, { recursive: true });
  const meta = await sharp(origen).metadata();
  if (!meta.width || !meta.height) throw new Error("No se pudo leer el tamaño de la foto");
  const left = Math.round(meta.width * IZQUIERDA);
  const top = Math.round(meta.height * TOP);
  const ancho = Math.round(meta.width * ANCHO);
  const alto = Math.round(ancho / RATIO_FOTO_MOVIL);
  if (top + alto > meta.height) throw new Error("El recorte se sale de la foto");
  console.log(
    `Original ${meta.width}x${meta.height}. Recorte 3:2: ${ancho}x${alto} desde x=${left}, y=${top}.`,
  );

  const base = sharp(origen)
    .rotate()
    .extract({ left, top, width: ancho, height: alto })
    .toColorspace("srgb");
  for (const w of ANCHOS_FOTO_MOVIL) {
    const alta = base.clone().resize({ width: w, kernel: "lanczos3" });
    const avif = join(destino, `angel-${w}.avif`);
    const webp = join(destino, `angel-${w}.webp`);
    await alta.clone().avif({ quality: 55, effort: 6 }).toFile(avif);
    await alta.clone().webp({ quality: 78, effort: 6 }).toFile(webp);
    const kb = (f: string) => (statSync(f).size / 1024).toFixed(1);
    console.log(`  ${w}w  avif ${kb(avif)} KB  webp ${kb(webp)} KB`);
  }
}

const arg = process.argv[2];
const origen = arg
  ? isAbsolute(arg)
    ? arg
    : join(process.cwd(), arg)
  : join(process.cwd(), "originales", "movil", "hero-movil.jpg");
if (!existsSync(origen)) {
  console.error(`No encuentro ${origen}`);
  process.exit(1);
}
main(origen).catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
