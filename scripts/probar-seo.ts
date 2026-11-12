/**
 * Guardia del SEO de la home y del JSON-LD del Person.
 *
 *   npm test        (o: npx tsx scripts/probar-seo.ts)
 *
 * Comprueba el título de la home (tope de 60 caracteres, sin em dashes ni dos puntos), que el
 * WebSite use el nombre corto del sitio y no el título, y que el Person lleve las certificaciones
 * de lib/certifications.ts como hasCredential, solo con nombre y emisor.
 */
import { CERTIFICATIONS } from "../lib/certifications";
import {
  BLOG_DESCRIPTIONS,
  BLOG_TITLES,
  HOME_DESCRIPTIONS,
  HOME_TITLES,
  SERVICE_DESCRIPTIONS,
  SERVICE_TITLES,
  SITE_NAME,
  homeJsonLd,
} from "../lib/seo";

let fallos = 0;
function comprobar(ok: boolean, texto: string) {
  console.log(`  ${ok ? "ok  " : "FALLO"} ${texto}`);
  if (!ok) fallos++;
}

const LANGS = ["es", "en"] as const;
const MARCA = " · Ángel Fernández";
const SIN_PUNTUACION = /[—:]/;

for (const lang of LANGS) {
  const titulo = HOME_TITLES[lang];
  const desc = HOME_DESCRIPTIONS[lang];
  comprobar(titulo.length <= 60, `[${lang}] título de la home de ${titulo.length} caracteres (máx. 60)`);
  comprobar(
    !SIN_PUNTUACION.test(titulo + desc),
    `[${lang}] título y descripción de la home sin em dashes ni dos puntos`,
  );
  comprobar(desc.length <= 160, `[${lang}] descripción de la home de ${desc.length} caracteres (máx. 160)`);

  // Servicios y blog: el <title> de los servicios lleva " · Ángel Fernández" detrás.
  const titulos: [string, string][] = [
    ...Object.entries(SERVICE_TITLES[lang]).map(([id, t]): [string, string] => [`servicio ${id}`, t + MARCA]),
    ["blog", BLOG_TITLES[lang]],
  ];
  const descripciones: [string, string][] = [
    ...Object.entries(SERVICE_DESCRIPTIONS[lang]).map(([id, t]): [string, string] => [`servicio ${id}`, t]),
    ["blog", BLOG_DESCRIPTIONS[lang]],
  ];
  for (const [n, t] of titulos)
    comprobar(
      t.length <= 60 && !SIN_PUNTUACION.test(t),
      `[${lang}] título de ${n}: ${t.length} caracteres (máx. 60), sin em dash ni dos puntos`,
    );
  for (const [n, t] of descripciones)
    comprobar(
      t.length <= 160 && !SIN_PUNTUACION.test(t),
      `[${lang}] descripción de ${n}: ${t.length} caracteres (máx. 160), sin em dash ni dos puntos`,
    );
}

type Nodo = Record<string, unknown> & { "@type": string };
const nodos = (homeJsonLd() as { "@graph": Nodo[] })["@graph"];
const website = nodos.find((n) => n["@type"] === "WebSite");
const person = nodos.find((n) => n["@type"] === "Person");

comprobar(website?.name === SITE_NAME, `WebSite.name es el nombre del sitio ("${SITE_NAME}")`);

const cred = (person?.hasCredential ?? []) as {
  "@type": string;
  name: string;
  recognizedBy: { "@type": string; name: string };
  [k: string]: unknown;
}[];
comprobar(
  cred.length === CERTIFICATIONS.length &&
    CERTIFICATIONS.every(
      (c, i) =>
        cred[i]["@type"] === "EducationalOccupationalCredential" &&
        cred[i].name === c.name &&
        cred[i].recognizedBy?.["@type"] === "Organization" &&
        cred[i].recognizedBy.name === c.issuer,
    ),
  `Person.hasCredential con las ${CERTIFICATIONS.length} certificaciones (nombre y emisor)`,
);
comprobar(
  cred.every((c) => Object.keys(c).sort().join() === "@type,name,recognizedBy"),
  "hasCredential sin fechas ni enlaces (solo @type, name y recognizedBy)",
);

if (fallos > 0) process.exit(1);
