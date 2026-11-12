/**
 * Genera las variantes AVIF y WebP de la foto del hero en public/hero/.
 *
 *   npx tsx scripts/generar-foto-hero.ts [nombre-del-original.jpg]
 *
 * El original (8 MB) va en `originales/` (ignorada por git), nunca en `public/`. Sin argumento usa la
 * única foto que haya en esa carpeta; con un nombre, esa. También acepta una ruta completa. Si cambia
 * la foto, se vuelve a lanzar con el nuevo original y se mantienen los mismos nombres.
 *
 * Recorte vertical 4:5 con todo el ancho de la foto (no se recorta el fondo por los lados). Empieza al
 * 12 % de la altura y termina al 95 %: deja el pelo con margen arriba y la mano, el reloj y el ratón
 * con margen abajo. El recorte es el mismo para escritorio y móvil; lo que cambia es el tamaño que
 * se pide (components/hero-photo.tsx). Sin metadatos EXIF (sharp los descarta) y en sRGB.
 */
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { isAbsolute, join } from "node:path";
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

/** Carpeta de los originales de cámara (en .gitignore). */
const CARPETA_ORIGINALES = join(process.cwd(), "originales");

function resolverOriginal(arg?: string): string {
  if (arg) {
    const candidatos = isAbsolute(arg)
      ? [arg]
      : [join(CARPETA_ORIGINALES, arg), join(process.cwd(), arg)];
    const encontrado = candidatos.find((c) => existsSync(c));
    if (!encontrado) throw new Error(`No encuentro "${arg}" en originales/ ni como ruta.`);
    return encontrado;
  }
  const fotos = existsSync(CARPETA_ORIGINALES)
    ? readdirSync(CARPETA_ORIGINALES).filter((f) => /[.](jpe?g|heic)$/i.test(f))
    : [];
  if (fotos.length === 0)
    throw new Error("No hay ninguna foto en originales/. Pon ahí el original.");
  if (fotos.length > 1) {
    throw new Error(`Hay ${fotos.length} fotos en originales/ (${fotos.join(", ")}). Indica cuál.`);
  }
  return join(CARPETA_ORIGINALES, fotos[0]);
}

try {
  main(resolverOriginal(process.argv[2])).catch((e) => {
    console.error(e instanceof Error ? e.message : e);
    process.exit(1);
  });
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
