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
import { HOME_DESCRIPTION, HOME_TITLE, SITE_NAME, homeJsonLd } from "../lib/seo";

let fallos = 0;
function comprobar(ok: boolean, texto: string) {
  console.log(`  ${ok ? "ok  " : "FALLO"} ${texto}`);
  if (!ok) fallos++;
}

comprobar(HOME_TITLE.length <= 60, `título de la home de ${HOME_TITLE.length} caracteres (máx. 60)`);
comprobar(
  !/[—:]/.test(HOME_TITLE + HOME_DESCRIPTION),
  "título y descripción de la home sin em dashes ni dos puntos",
);
comprobar(HOME_DESCRIPTION.length <= 160, `descripción de ${HOME_DESCRIPTION.length} caracteres (máx. 160)`);

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
