/**
 * Verificación de las rutas por idioma contra un servidor en marcha (no entra en `npm test`).
 *
 *   npm run build && npm run start   (en otra terminal)
 *   npx tsx scripts/verificar-idiomas.ts [http://localhost:3000]
 *
 * Comprueba códigos y redirecciones, <html lang>, título y descripción por idioma, hreflang
 * recíprocos, JSON-LD válido, que los enlaces internos de /en/... se queden en /en/... y los 404.
 */

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const SITE = "https://www.angel-fernandez.es";

let fallos = 0;
function comprobar(ok: boolean, texto: string) {
  console.log(`  ${ok ? "ok  " : "FALLO"} ${texto}`);
  if (!ok) fallos++;
}

async function pedir(ruta: string) {
  const r = await fetch(`${BASE}${ruta}`, { redirect: "manual" });
  const cuerpo = r.status >= 300 && r.status < 400 ? "" : await r.text();
  return { status: r.status, location: r.headers.get("location") ?? "", cuerpo };
}

function etiquetas(html: string, re: RegExp): string[] {
  return [...html.matchAll(re)].map((m) => m[1] ?? m[0]);
}

function atributo(tag: string, nombre: string): string {
  const m = tag.match(new RegExp(`${nombre}="([^"]*)"`, "i"));
  return m ? m[1] : "";
}

/** Los <link rel="alternate" hreflang> de una página. */
function hreflangs(html: string): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const tag of html.match(/<link[^>]*rel="alternate"[^>]*>/gi) ?? []) {
    const lang = atributo(tag, "hrefLang");
    if (lang) salida[lang] = atributo(tag, "href");
  }
  return salida;
}

/** href de los <a> de la página, sin el selector de idioma (lleva hreflang a propósito). */
function hrefsDeEnlaces(html: string): string[] {
  return (html.match(/<a [^>]*>/gi) ?? [])
    .filter((tag) => !/hreflang=/i.test(tag))
    .map((tag) => atributo(tag, "href"))
    .filter(Boolean);
}

function canonical(html: string): string {
  const tag = (html.match(/<link[^>]*rel="canonical"[^>]*>/i) ?? [""])[0];
  return atributo(tag, "href");
}

function ruta(url: string): string {
  return url.startsWith(SITE) ? url.slice(SITE.length) || "/" : url;
}

const PRIVADAS = ["admin", "portal", "login", "mfa", "contrasena", "auth", "api"];
/** ¿Es un enlace interno de página (no un archivo ni una ruta privada)? */
function esEnlaceDePagina(href: string): boolean {
  if (!href.startsWith("/") || href.startsWith("//")) return false;
  const primero = href.slice(1).split(/[/?#]/)[0];
  if (PRIVADAS.includes(primero) || primero === "_next") return false;
  const sinAncla = href.split("#")[0].split("?")[0];
  const ultimo = sinAncla.split("/").pop() ?? "";
  return !ultimo.includes("."); // archivos (webp, pdf, xml...) no son páginas
}

async function principal() {
  console.log("Códigos y redirecciones");
  for (const [r, status, destino] of [
    ["/", 200, ""],
    ["/en", 200, ""],
    ["/en/servicios/web", 200, ""],
    ["/servicios/sistemas", 200, ""],
    ["/es", 308, "/"],
    ["/es/servicios/web", 308, "/servicios/web"],
    ["/es/blog", 308, "/blog"],
    ["/ruta-que-no-existe", 404, ""],
    ["/en/ruta-que-no-existe", 404, ""],
    ["/servicios/nada", 404, ""],
    ["/sitemap.xml", 200, ""],
    ["/robots.txt", 200, ""],
    ["/og-home.jpg", 200, ""],
    ["/login", 200, ""],
  ] as [string, number, string][]) {
    const p = await pedir(r);
    const dest = p.location ? new URL(p.location, BASE).pathname : "";
    comprobar(
      p.status === status && (destino === "" || dest === destino),
      `${r} da ${p.status}${dest ? ` a ${dest}` : ""} (esperado ${status}${destino ? ` a ${destino}` : ""})`,
    );
  }

  // Páginas para las comprobaciones de contenido: parten del sitemap.
  const mapa = (await pedir("/sitemap.xml")).cuerpo;
  const locs = etiquetas(mapa, /<loc>([^<]+)<\/loc>/g).map(ruta);
  comprobar(locs.length > 0, `el sitemap trae ${locs.length} URLs`);
  comprobar(
    locs.every((u) => !u.startsWith("/es")),
    "ninguna URL del sitemap empieza por /es",
  );
  const enUrls = locs.filter((u) => u === "/en" || u.startsWith("/en/"));
  const esUrls = locs.filter((u) => !(u === "/en" || u.startsWith("/en/")));
  comprobar(
    enUrls.length > 0,
    `el sitemap trae ${enUrls.length} URLs en inglés y ${esUrls.length} en español`,
  );

  console.log("\nPor página");
  const titulosVistos = new Map<string, string>();
  for (const u of locs) {
    const p = await pedir(u);
    const esEn = u === "/en" || u.startsWith("/en/");
    const html = p.cuerpo;
    if (p.status !== 200) {
      comprobar(false, `${u} del sitemap da ${p.status}`);
      continue;
    }
    const lang = (html.match(/<html[^>]*lang="([a-z]+)"/i) ?? [])[1];
    comprobar(lang === (esEn ? "en" : "es"), `${u}: <html lang="${lang}">`);
    const titulos = etiquetas(html, /<title>([^<]*)<\/title>/g);
    const descs = html.match(/<meta[^>]*name="description"[^>]*>/gi) ?? [];
    comprobar(
      titulos.length === 1 && descs.length === 1,
      `${u}: un solo title y una sola description`,
    );
    const clave = `${titulos[0]}|${atributo(descs[0] ?? "", "content")}`;
    const otro = titulosVistos.get(clave);
    comprobar(
      !otro,
      `${u}: title y description distintos de los de otra URL${otro ? ` (igual que ${otro})` : ""}`,
    );
    titulosVistos.set(clave, u);

    // canonical propio y hreflang recíprocos
    comprobar(ruta(canonical(html)) === u, `${u}: canonical propio (${ruta(canonical(html))})`);
    const hl = hreflangs(html);
    const otros = Object.entries(hl).filter(([k]) => k !== "x-default");
    comprobar(otros.length > 0, `${u}: hreflang ${JSON.stringify(Object.keys(hl))}`);
    for (const [l, destino] of otros) {
      if (ruta(destino) === u) continue;
      const vuelta = hreflangs((await pedir(ruta(destino))).cuerpo);
      comprobar(
        Object.values(vuelta).some((d) => ruta(d) === u),
        `${u}: ${l} (${ruta(destino)}) le devuelve el hreflang`,
      );
    }
    comprobar(
      ruta(hl["x-default"] ?? "") !== "" && !ruta(hl["x-default"]).startsWith("/en"),
      `${u}: x-default es el español`,
    );

    // JSON-LD
    const bloques = etiquetas(
      html,
      /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
    );
    // Las páginas legales no llevan JSON-LD.
    const sinJsonLd = ["/aviso-legal", "/privacidad", "/cookies"].includes(
      u.startsWith("/en") ? u.slice(3) || "/" : u,
    );
    let jsonOk = sinJsonLd || bloques.length > 0;
    for (const b of bloques) {
      try {
        const j = JSON.parse(b);
        if (!j["@graph"]) jsonOk = false;
      } catch {
        jsonOk = false;
      }
    }
    comprobar(jsonOk, `${u}: JSON-LD válido (${bloques.length} bloque)`);
    if (esEn && bloques.length) {
      const urls = [...bloques.join("").matchAll(/"url":"([^"]+)"/g)].map((m) => m[1]);
      comprobar(
        urls.every(
          (x) =>
            !x.startsWith(SITE) ||
            ruta(x) === "/" ||
            ruta(x) === "/en" ||
            ruta(x).startsWith("/en/"),
        ),
        `${u}: las url del JSON-LD están bajo /en`,
      );
      comprobar(
        !/"inLanguage":"es"/.test(bloques.join("")),
        `${u}: el JSON-LD no declara inLanguage es`,
      );
    }

    // Enlaces internos de /en/... dentro de /en/...
    if (esEn) {
      const hrefs = hrefsDeEnlaces(html).map((h) => h.replace(/&amp;/g, "&"));
      const malos = hrefs.filter(
        (h) =>
          esEnlaceDePagina(h) && !(h === "/en" || h.startsWith("/en/") || h.startsWith("/en#")),
      );
      comprobar(
        malos.length === 0,
        `${u}: enlaces internos dentro de /en${malos.length ? ` (fuera: ${[...new Set(malos)].join(", ")})` : ""}`,
      );
    } else {
      const hrefs = hrefsDeEnlaces(html);
      const malos = hrefs.filter((h) => h === "/en" || h.startsWith("/en/"));
      // Solo el selector de idioma puede apuntar a /en desde una página en español.
      comprobar(malos.length <= 1, `${u}: solo el selector apunta a /en (${malos.length})`);
    }
  }

  // El inglés se pinta en el HTML sin JS: textos clave en inglés y sin restos del español.
  console.log("\nHTML en inglés sin JS");
  const en = (await pedir("/en")).cuerpo;
  comprobar(/Your <span[^>]*>IT<\/span> and your/.test(en), "/en: el h1 sale en inglés en el HTML");
  comprobar(!en.includes("funcionando y sin sustos"), "/en: el h1 no está en español");
  const enServ = (await pedir("/en/servicios/web")).cuerpo;
  comprobar(
    !enServ.includes("Pedir presupuesto"),
    "/en/servicios/web: sin textos del español en el botón",
  );

  console.log(fallos === 0 ? "\nTodo en orden." : `\n${fallos} comprobaciones fallidas.`);
  process.exit(fallos === 0 ? 0 : 1);
}

principal();
