/**
 * Guardia contra regresiones de cookies: la web pública no usa cookies no esenciales y por eso
 * no lleva banner de consentimiento. Este test falla si alguien añade analítica, píxeles o
 * contenido incrustado en package.json, app/layout.tsx o components/.
 *
 *   npm test        (o: npx tsx scripts/probar-cookies.ts)
 *
 * Si falla, antes de añadir el servicio hace falta un banner de consentimiento (ver
 * docs/cookies.md) y actualizar /cookies y /privacidad.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const RAIZ = process.cwd();

const PROHIBIDOS = [
  "@vercel/analytics",
  "@vercel/speed-insights",
  "googletagmanager",
  "gtag(",
  "fbq(",
  "hotjar",
  "clarity.ms",
  "plausible",
  "youtube.com/embed",
  "<iframe",
];

function archivos(ruta: string): string[] {
  if (statSync(ruta).isFile()) return [ruta];
  return readdirSync(ruta).flatMap((n) => archivos(join(ruta, n)));
}

const objetivos = [
  join(RAIZ, "package.json"),
  join(RAIZ, "app", "layout.tsx"),
  ...archivos(join(RAIZ, "components")).filter((f) => /[.](ts|tsx)$/.test(f)),
];

const fallos: string[] = [];
for (const f of objetivos) {
  const texto = readFileSync(f, "utf8").toLowerCase();
  for (const p of PROHIBIDOS) {
    if (texto.includes(p.toLowerCase())) {
      fallos.push(`${relative(RAIZ, f).replaceAll("\\", "/")} contiene "${p}"`);
    }
  }
}

if (fallos.length > 0) {
  console.error(
    "FALLO. Hace falta un banner de consentimiento (ver docs/cookies.md) antes de añadir esto:",
  );
  for (const f of fallos) console.error("  " + f);
  process.exit(1);
}
console.log(
  `  ok   sin analítica ni contenido de terceros (${objetivos.length} archivos revisados)`,
);
