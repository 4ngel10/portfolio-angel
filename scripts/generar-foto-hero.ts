/**
 * Genera las variantes AVIF y WebP de la foto del hero en public/hero/.
 *
 *   npx tsx scripts/generar-foto-hero.ts <ruta-del-original.jpg>
 *
 * El original (8 MB) no se sube al repo: se guarda fuera de public/. Si cambia la foto, se vuelve a
 * lanzar este script con el nuevo original y se mantienen los mismos nombres.
 *
 * Recorte vertical 4:5 con todo el ancho de la foto (no se recorta el fondo por los lados). Empieza al
 * 12 % de la altura y termina al 95 %: deja el pelo con margen arriba y la mano, el reloj y el ratón
 * con margen abajo. El recorte es el mismo para escritorio y móvil; lo que cambia es el tamaño que
 * se pide (components/hero-photo.tsx). Sin metadatos EXIF (sharp los descarta) y en sRGB.
 */
import { mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { ANCHOS_FOTO, RATIO_FOTO } from "../lib/hero-foto";

const TOP = 0.12;

async function main(origen: string) {
  const destino = join(process.cwd(), "public", "hero");
  mkdirSync(destino, { recursive: true });

  const meta = await sharp(origen).metadata();
  if (!meta.width || !meta.height) throw new Error("No se pudo leer el tamaño de la foto");
  const top = Math.round(meta.height * TOP);
  const alto = Math.round(meta.width / RATIO_FOTO);
  if (top + alto > meta.height) throw new Error("El recorte se sale de la foto");
  console.log(
    `Original ${meta.width}x${meta.height}. Recorte 4:5: ${meta.width}x${alto} desde y=${top}.`,
  );

  // rotate() aplica la orientación EXIF antes de recortar.
  const base = sharp(origen)
    .rotate()
    .extract({ left: 0, top, width: meta.width, height: alto })
    .toColorspace("srgb");

  for (const ancho of ANCHOS_FOTO) {
    const alta = base.clone().resize({ width: ancho, kernel: "lanczos3" });
    const avif = join(destino, `angel-${ancho}.avif`);
    const webp = join(destino, `angel-${ancho}.webp`);
    await alta.clone().avif({ quality: 55, effort: 6 }).toFile(avif);
    await alta.clone().webp({ quality: 78, effort: 6 }).toFile(webp);
    const kb = (f: string) => (statSync(f).size / 1024).toFixed(1);
    console.log(`  ${ancho}w  avif ${kb(avif)} KB  webp ${kb(webp)} KB`);
  }
}

const origen = process.argv[2];
if (!origen) {
  console.error("Uso: npx tsx scripts/generar-foto-hero.ts <ruta-del-original.jpg>");
  process.exit(1);
}
main(origen).catch((e) => {
  console.error(e);
  process.exit(1);
});
