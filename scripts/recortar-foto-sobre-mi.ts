/**
 * Quita el fondo de las fotos de Sobre mí y escribe los recortes transparentes.
 *
 *   npx tsx scripts/recortar-foto-sobre-mi.ts            tema claro: originales/sobre-mi/Foto_top.jpg
 *   npx tsx scripts/recortar-foto-sobre-mi.ts --oscuro   tema oscuro: originales/sobre-mi/sobremi_oscuro.jpg
 *   npx tsx scripts/generar-foto-sobre-mi.ts [--oscuro]  (después, las variantes AVIF y WebP)
 *
 * Claro escribe public/angel-cutout.webp (520 px de ancho) y angel-cutout-sm.webp (224 px); oscuro,
 * public/angel-cutout-dark.webp. Los originales (ignorados por git) nunca van en public/.
 *
 * Fondo claro: blanco liso, se marca como fondo lo casi blanco conectado con el borde (relleno por
 * inundación, así el blanco del reloj o del cuello no se toca). Fondo oscuro: azul marino casi liso, se
 * marca lo que se parece al color del borde (mediana de los píxeles del borde). Después se come unos
 * píxeles del contorno para que no quede halo y se suaviza el borde. Los dos recortes tienen la misma
 * proporción (RATIO), así al cambiar de tema la foto no mueve el diseño. Todo local, no se sube nada a
 * ningún servicio.
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const OSCURO = process.argv.includes("--oscuro");
const UMBRAL = 232; // canal mínimo a partir del cual un píxel cuenta como fondo (fondo claro)
const TOLERANCIA = 9; // distancia máxima al color del borde (fondo oscuro)
const RATIO = 520 / 1056; // ancho / alto del recorte, el mismo en los dos temas
const ANCHO_FINAL = 520;
const ANCHO_SM = 224;

async function main(origen: string) {
  const { data, info } = await sharp(origen)
    .rotate()
    .toColorspace("srgb")
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;

  // 1. Relleno por inundación desde el borde sobre píxeles casi blancos.
  const fondo = new Uint8Array(w * h);
  const pila: number[] = [];
  let fondoRgb = [255, 255, 255];
  if (OSCURO) {
    const borde: number[][] = [[], [], []];
    for (let x = 0; x < w; x++)
      for (const y of [0, h - 1])
        for (let c = 0; c < 3; c++) borde[c].push(data[(y * w + x) * 3 + c]);
    for (let y = 0; y < h; y++)
      for (const x of [0, w - 1])
        for (let c = 0; c < 3; c++) borde[c].push(data[(y * w + x) * 3 + c]);
    fondoRgb = borde.map((v) => v.sort((a, b) => a - b)[v.length >> 1]);
  }
  const claro = (i: number) => {
    const r = data[i * 3],
      g = data[i * 3 + 1],
      b = data[i * 3 + 2];
    if (!OSCURO) return Math.min(r, g, b) >= UMBRAL;
    return Math.hypot(r - fondoRgb[0], g - fondoRgb[1], b - fondoRgb[2]) <= TOLERANCIA;
  };
  const sembrar = (x: number, y: number) => {
    const i = y * w + x;
    if (!fondo[i] && claro(i)) {
      fondo[i] = 1;
      pila.push(i);
    }
  };
  for (let x = 0; x < w; x++) {
    sembrar(x, 0);
    sembrar(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    sembrar(0, y);
    sembrar(w - 1, y);
  }
  while (pila.length) {
    const i = pila.pop()!;
    const x = i % w;
    const y = (i - x) / w;
    if (x > 0) sembrar(x - 1, y);
    if (x < w - 1) sembrar(x + 1, y);
    if (y > 0) sembrar(x, y - 1);
    if (y < h - 1) sembrar(x, y + 1);
  }

  // 2. Máscara: 255 sujeto, 0 fondo. El borde inferior no es fondo aunque sea claro (sale cortado).
  let alfa = Buffer.alloc(w * h);
  for (let i = 0; i < w * h; i++) alfa[i] = fondo[i] ? 0 : 255;

  // 3. Erosión de 3 px (quita el halo blanco) y suavizado del borde.
  const erosionar = (src: Buffer) => {
    const out = Buffer.from(src);
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (src[i] && (!src[i - 1] || !src[i + 1] || !src[i - w] || !src[i + w])) out[i] = 0;
      }
    return out;
  };
  alfa = erosionar(erosionar(erosionar(alfa)));
  const suave = await sharp(alfa, { raw: { width: w, height: h, channels: 1 } })
    .blur(1.1)
    .toColourspace("b-w")
    .raw()
    .toBuffer();

  // 4. Caja del sujeto.
  let x0 = w,
    x1 = 0,
    y0 = h;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (suave[y * w + x] > 128) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
      }
  const mx = Math.round((x1 - x0) * 0.04);
  const my = Math.round((x1 - x0) * 0.04);
  const left = Math.max(0, x0 - mx);
  const top = Math.max(0, y0 - my);
  const ancho = Math.min(w, x1 + mx) - left;
  const alto = Math.min(h - top, Math.round(ancho / RATIO));
  console.log(`Original ${w}x${h}. Recorte ${ancho}x${alto} desde x=${left}, y=${top}.`);

  const rgba = Buffer.alloc(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    rgba[i * 4] = data[i * 3];
    rgba[i * 4 + 1] = data[i * 3 + 1];
    rgba[i * 4 + 2] = data[i * 3 + 2];
    rgba[i * 4 + 3] = suave[i];
  }
  const base = sharp(rgba, { raw: { width: w, height: h, channels: 4 } }).extract({
    left,
    top,
    width: ancho,
    height: alto,
  });
  const pub = join(process.cwd(), "public");
  const grande = await base
    .clone()
    .resize({ width: ANCHO_FINAL, kernel: "lanczos3" })
    .webp({ quality: 85, alphaQuality: 95, effort: 6 })
    .toFile(join(pub, OSCURO ? "angel-cutout-dark.webp" : "angel-cutout.webp"));
  if (!OSCURO)
    await base
      .clone()
      .resize({ width: ANCHO_SM, kernel: "lanczos3" })
      .webp({ quality: 80, alphaQuality: 90, effort: 6 })
      .toFile(join(pub, "angel-cutout-sm.webp"));
  console.log(`${OSCURO ? "dark" : "claro"} ${grande.width}x${grande.height}`);
}

const argOrigen = process.argv.slice(2).find((a) => !a.startsWith("--"));
const origen =
  argOrigen ??
  join(process.cwd(), "originales", "sobre-mi", OSCURO ? "sobremi_oscuro.jpg" : "Foto_top.jpg");
if (!existsSync(origen)) {
  console.error(`No encuentro ${origen}`);
  process.exit(1);
}
main(origen).catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
