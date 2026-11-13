/**
 * Guardia de las rutas por idioma, sin red.
 *
 *   npm test        (o: npx tsx scripts/probar-rutas-idioma.ts)
 *
 * Comprueba lib/rutas.ts (localizedHref, stripLocale, otherLocalePath), que alternatesFor es
 * recíproco y que el sitemap tiene una URL inglesa por cada española con traducción (y al revés),
 * sin ninguna URL que empiece por /es.
 */
import { localizedHref, otherLocalePath, stripLocale } from "../lib/rutas";
import { alternatesFor } from "../lib/seo";
import { construirSitemap } from "../lib/sitemap-entradas";
import { SITE_URL } from "../lib/site";
import type { BlogPost, BlogPostContent } from "../lib/blog-types";

let fallos = 0;
function comprobar(ok: boolean, texto: string) {
  console.log(`  ${ok ? "ok  " : "FALLO"} ${texto}`);
  if (!ok) fallos++;
}
function igual(real: unknown, esperado: unknown, texto: string) {
  const ok = real === esperado;
  comprobar(
    ok,
    ok ? texto : `${texto} (era ${JSON.stringify(real)}, esperaba ${JSON.stringify(esperado)})`,
  );
}

// localizedHref
igual(localizedHref("es", "/"), "/", "es: la home sigue en /");
igual(localizedHref("en", "/"), "/en", "en: la home pasa a /en");
igual(localizedHref("es", "/#about"), "/#about", "es: ancla de la home igual");
igual(localizedHref("en", "/#about"), "/en#about", "en: /#about pasa a /en#about");
igual(localizedHref("en", "#top"), "#top", "en: ancla suelta sin cambios");
igual(localizedHref("en", "/servicios/web"), "/en/servicios/web", "en: ruta anidada");
igual(
  localizedHref("en", "/servicios/sistemas#mantenimiento"),
  "/en/servicios/sistemas#mantenimiento",
  "en: ruta con ancla",
);
igual(
  localizedHref("en", "/blog/vpn-pyme-acceso-remoto"),
  "/en/blog/vpn-pyme-acceso-remoto",
  "en: slug de artículo",
);
igual(
  localizedHref("en", "https://example.com/x"),
  "https://example.com/x",
  "en: enlace externo igual",
);
igual(localizedHref("en", "mailto:a@b.es"), "mailto:a@b.es", "en: mailto igual");
igual(localizedHref("en", "/login"), "/login", "en: /login no lleva prefijo");
igual(localizedHref("en", "/portal/horas"), "/portal/horas", "en: el portal no lleva prefijo");
igual(localizedHref("en", "/api/csp-report"), "/api/csp-report", "en: la API no lleva prefijo");

// stripLocale y otherLocalePath
igual(stripLocale("/en"), "/", "stripLocale: /en es /");
igual(stripLocale("/en/blog/x"), "/blog/x", "stripLocale: /en/blog/x es /blog/x");
igual(stripLocale("/es/blog"), "/blog", "stripLocale: /es/blog es /blog");
igual(stripLocale("/enlace"), "/enlace", "stripLocale: /enlace no es /en");
igual(stripLocale("/servicios/web"), "/servicios/web", "stripLocale: español igual");
igual(otherLocalePath("/", "es"), "/en", "otra versión de / es /en");
igual(otherLocalePath("/en", "en"), "/", "otra versión de /en es /");
igual(
  otherLocalePath("/servicios/web", "es"),
  "/en/servicios/web",
  "otra versión de /servicios/web",
);
igual(otherLocalePath("/en/blog/x", "en"), "/blog/x", "otra versión de /en/blog/x");

// alternatesFor: recíproco y con x-default en español
for (const ruta of ["/", "/servicios/web", "/blog/x"]) {
  const es = alternatesFor(ruta, "es");
  const en = alternatesFor(ruta, "en");
  comprobar(
    JSON.stringify(es.languages) === JSON.stringify(en.languages),
    `alternatesFor ${ruta}: las dos versiones declaran los mismos hreflang`,
  );
  igual(
    es.languages["x-default"],
    es.languages.es,
    `alternatesFor ${ruta}: x-default es el español`,
  );
  igual(
    es.canonical,
    es.languages.es,
    `alternatesFor ${ruta}: el canonical español es su hreflang es`,
  );
  igual(
    en.canonical,
    en.languages.en,
    `alternatesFor ${ruta}: el canonical inglés es su hreflang en`,
  );
}
const soloEs = alternatesFor("/blog/solo-es", "es", ["es"]);
comprobar(!("en" in soloEs.languages), "alternatesFor sin traducción: no declara hreflang en");

// Sitemap con un artículo traducido y otro que no
function contenido(titulo: string): BlogPostContent {
  return {
    title: titulo,
    excerpt: "e",
    description: "d",
    intro: "i",
    sections: [{ heading: "h", blocks: ["p"] }],
  };
}
function articulo(slug: string, traducido: boolean): BlogPost {
  return {
    slug,
    category: "sistemas",
    date: "2026-01-01",
    publishedAt: "2026-01-01T09:00:00+01:00",
    updatedAt: "2026-01-02T09:00:00+01:00",
    ogImage: null,
    post: {
      es: contenido("t"),
      en: traducido ? contenido("t") : { ...contenido(""), sections: [] },
    },
  };
}
const mapa = construirSitemap([articulo("con-ingles", true), articulo("sin-ingles", false)]);
const urls = mapa.map((e) => e.url);
comprobar(
  urls.every((u) => !u.startsWith(`${SITE_URL}/es`)),
  "ninguna URL del sitemap empieza por /es",
);
comprobar(
  urls.includes(`${SITE_URL}/en/blog/con-ingles`),
  "artículo traducido: URL en inglés en el sitemap",
);
comprobar(
  !urls.includes(`${SITE_URL}/en/blog/sin-ingles`),
  "artículo sin traducción: sin URL en inglés",
);
comprobar(
  urls.includes(`${SITE_URL}/blog/sin-ingles`),
  "artículo sin traducción: sigue en español",
);
const sinPar = urls.filter((u) => {
  const esEn = u === `${SITE_URL}/en` || u.startsWith(`${SITE_URL}/en/`);
  const otra = esEn
    ? u.replace(`${SITE_URL}/en`, "") || "/"
    : u === SITE_URL
      ? "/en"
      : `/en${u.slice(SITE_URL.length)}`;
  const pareja = esEn ? `${SITE_URL}${otra === "/" ? "" : otra}` : `${SITE_URL}${otra}`;
  return !urls.includes(pareja) && !u.includes("sin-ingles");
});
comprobar(
  sinPar.length === 0,
  `cada URL tiene su hermana en el otro idioma (sin pareja: ${sinPar.join(", ") || "ninguna"})`,
);
// Reciprocidad de alternates en el sitemap
let asimetricas = 0;
for (const e of mapa) {
  const langs = e.alternates?.languages as Record<string, string> | undefined;
  if (!langs) continue;
  for (const destino of Object.values(langs)) {
    const otra = mapa.find((x) => x.url === destino);
    const vuelta = otra?.alternates?.languages as Record<string, string> | undefined;
    if (!vuelta || !Object.values(vuelta).includes(e.url)) asimetricas++;
  }
}
comprobar(asimetricas === 0, "los alternates del sitemap son recíprocos");

if (fallos > 0) process.exit(1);
