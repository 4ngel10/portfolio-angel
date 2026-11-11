/**
 * Pruebas del comprobador (lib/blog-validate.ts), del conversor (lib/blog-markup.ts), de las
 * reglas del SVG (lib/blog-svg.ts) y del ajuste del título de la imagen social (lib/blog-og.ts).
 *
 *   npm test        (o: npx tsx scripts/probar-blog.ts)
 *
 * Sale con código 1 si falla algo. Usa un artículo de ejemplo (scripts/fixtures). Si se pasa
 * BLOG_EXPORT con la ruta del JSON de /api/admin/blog/exportar, prueba además la ida y vuelta del
 * conversor con los artículos reales:
 *
 *   BLOG_EXPORT=C:/ruta/blog-2026-11-10.json npm test
 */
import { readFileSync } from "node:fs";
import { bloquesATexto, imagenesConocidas, textoABloques } from "../lib/blog-markup";
import { validarPost, type PostParaValidar } from "../lib/blog-validate";
import { DENSIDAD_BASE, DENSIDAD_MAXIMA, densidadSvg, motivoSvgInseguro } from "../lib/blog-svg";
import { ajustarTitulo, MAX_LINEAS, partirTitulo, TAMANOS_TITULO } from "../lib/blog-og";
import type { BlogPostContent } from "../lib/blog-types";
import { ARTICULO_EJEMPLO, type ArticuloPrueba } from "./fixtures/blog-articulo";

let fallos = 0;
let pasadas = 0;

function comprobar(nombre: string, condicion: boolean, detalle?: string) {
  if (condicion) {
    pasadas++;
    console.log(`  ok   ${nombre}`);
  } else {
    fallos++;
    console.log(`  FALLA ${nombre}${detalle ? `\n         ${detalle}` : ""}`);
  }
}

const clonar = <T>(valor: T): T => JSON.parse(JSON.stringify(valor)) as T;

/** JSON con las claves ordenadas (el jsonb de Postgres no conserva el orden de las claves). */
function canonico(valor: unknown): string {
  if (Array.isArray(valor)) return `[${valor.map(canonico).join(",")}]`;
  if (valor && typeof valor === "object") {
    const o = valor as Record<string, unknown>;
    return `{${Object.keys(o)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonico(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(valor) ?? "null";
}

function paraValidar(a: ArticuloPrueba): PostParaValidar {
  return {
    slug: a.slug,
    category: a.category,
    ogImage: a.ogImage,
    creadoPor: a.creadoPor,
    es: a.post.es,
    en: a.post.en,
  };
}

/** Artículos reales de un JSON exportado desde el panel, si se pasó BLOG_EXPORT. */
function cargarExportados(): ArticuloPrueba[] {
  const ruta = process.env.BLOG_EXPORT;
  if (!ruta) return [];
  const datos = JSON.parse(readFileSync(ruta, "utf8")) as {
    posts: {
      slug: string;
      category: ArticuloPrueba["category"];
      og_image: string | null;
      created_by: string;
      content: ArticuloPrueba["post"];
    }[];
  };
  return datos.posts.map((p) => ({
    slug: p.slug,
    category: p.category,
    ogImage: p.og_image,
    creadoPor: p.created_by,
    post: p.content,
  }));
}

const exportados = cargarExportados();

/** Texto de relleno con el largo exacto que se pide. */
function conLargo(n: number): string {
  return "a".repeat(n);
}

console.log("Validador, artículo de ejemplo");
{
  const r = validarPost(paraValidar(ARTICULO_EJEMPLO), { publicar: true });
  comprobar(
    "el artículo de ejemplo se acepta sin errores",
    r.errores.length === 0,
    r.errores.map((e) => `${e.ruta}: ${e.mensaje}`).join(" | "),
  );
}
for (const a of exportados) {
  const r = validarPost(paraValidar(a), { publicar: true });
  const detalle = r.errores.map((e) => `${e.ruta}: ${e.mensaje}`).join(" | ");
  console.log(`  info ${a.slug}: ${r.errores.length} errores${detalle ? ` (${detalle})` : ""}`);
}

console.log("Validador, casos que debe detectar");
{
  const base = paraValidar(ARTICULO_EJEMPLO);

  const raya = clonar(base);
  raya.es.intro = `${raya.es.intro} ${String.fromCharCode(0x2014)} y más.`;
  comprobar(
    "detecta una raya larga",
    validarPost(raya, { publicar: true }).errores.some((e) => e.ruta === "es.intro"),
  );

  const dosPuntos = clonar(base);
  const h2 = dosPuntos.es.sections.find((s) => s.heading);
  if (h2) h2.heading = `${h2.heading}${String.fromCharCode(0x3a)} algo`;
  comprobar(
    "detecta un dos puntos en un H2",
    validarPost(dosPuntos, { publicar: true }).errores.some(
      (e) => e.ruta.startsWith("es.sections[") && e.ruta.endsWith(".heading"),
    ),
  );

  const slug = clonar(base);
  slug.slug = "Mi-Articulo";
  comprobar(
    "detecta un slug con mayúsculas",
    validarPost(slug, { publicar: true }).errores.some((e) => e.ruta === "slug"),
  );
  comprobar(
    "un slug inválido bloquea también al guardar un borrador",
    validarPost(slug, { publicar: false }).errores.some((e) => e.ruta === "slug"),
  );

  const corta = clonar(base);
  corta.es.description = conLargo(100);
  comprobar(
    "detecta una description de 100 caracteres",
    validarPost(corta, { publicar: true }).errores.some((e) => e.ruta === "es.description"),
  );

  const larga = clonar(base);
  larga.es.description = conLargo(160);
  comprobar(
    "detecta una description de 160 caracteres",
    validarPost(larga, { publicar: true }).errores.some((e) => e.ruta === "es.description"),
  );

  const limite = clonar(base);
  limite.es.description = conLargo(120);
  limite.en.description = conLargo(155);
  comprobar(
    "acepta descriptions de 120 y de 155 caracteres",
    !validarPost(limite, { publicar: true }).errores.some((e) => e.ruta.endsWith(".description")),
  );

  const zona = clonar(base);
  zona.es.title = "Informática en Palma de Mallorca";
  comprobar(
    "detecta Palma de Mallorca en el título",
    validarPost(zona, { publicar: true }).errores.some((e) => e.ruta === "es.title"),
  );

  const sinEnlace = clonar(base);
  for (const idioma of ["es", "en"] as const) {
    for (const s of sinEnlace[idioma].sections) {
      s.blocks = s.blocks.map((b) =>
        typeof b === "string" ? b.split("](/servicios/").join("](/otra-cosa/") : b,
      );
    }
    sinEnlace[idioma].intro = sinEnlace[idioma].intro.split("](/servicios/").join("](/otra-cosa/");
  }
  comprobar(
    "detecta que falta el enlace a un servicio",
    validarPost(sinEnlace, { publicar: true }).errores.some((e) =>
      e.mensaje.includes("/servicios/"),
    ),
  );

  const sinTamano = clonar(base);
  for (const s of sinTamano.es.sections) {
    for (const b of s.blocks) if (typeof b === "object" && "img" in b) b.width = 0;
  }
  comprobar(
    "detecta una imagen sin width",
    validarPost(sinTamano, { publicar: true }).errores.some((e) => e.ruta.endsWith(".width")),
  );

  const tituloEn = clonar(base);
  tituloEn.en.title = conLargo(70);
  tituloEn.en.seoTitle = undefined;
  const rTituloEn = validarPost(tituloEn, { publicar: true });
  comprobar(
    "un título EN de más de 60 caracteres es aviso, no error",
    !rTituloEn.errores.some((e) => e.ruta === "en.title") &&
      rTituloEn.avisos.some((a) => a.ruta === "en.title"),
  );
  const tituloEs = clonar(base);
  tituloEs.es.title = conLargo(70);
  tituloEs.es.seoTitle = undefined;
  comprobar(
    "un título ES de más de 60 caracteres es error",
    validarPost(tituloEs, { publicar: true }).errores.some((e) => e.ruta === "es.title"),
  );

  const sinImagenes = clonar(base);
  for (const l of ["es", "en"] as const) {
    for (const s of sinImagenes[l].sections)
      s.blocks = s.blocks.filter((b) => typeof b === "string" || !("img" in b));
  }
  comprobar(
    "menos de 2 imágenes es error en un artículo nuevo",
    validarPost(sinImagenes, { publicar: true }).errores.some(
      (e) => e.ruta === "es.sections" && e.mensaje.includes("imágenes"),
    ),
  );
  const migrado = validarPost({ ...sinImagenes, creadoPor: "migracion" }, { publicar: true });
  comprobar(
    "menos de 2 imágenes es aviso en un artículo migrado",
    !migrado.errores.some((e) => e.mensaje.includes("2 imágenes")) &&
      migrado.avisos.some((a) => a.mensaje.includes("2 imágenes")),
  );

  const rango = clonar(base);
  rango.es.intro = `${rango.es.intro} Responde en 24-48 horas.`;
  comprobar(
    "avisa de un rango con guion",
    validarPost(rango, { publicar: true }).avisos.some((a) => a.ruta === "es.intro"),
  );
}

console.log("SVG, comprobación previa a convertirlo a WebP");
{
  const cab = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"';
  comprobar(
    "acepta un SVG limpio",
    motivoSvgInseguro(`${cab}><rect width="5" height="5"/></svg>`) === null,
  );
  const malos: [string, string][] = [
    ["<script", `${cab}><script>alert(1)</script></svg>`],
    ["onload", `${cab} onload="alert(1)"></svg>`],
    ["javascript:", `${cab}><a href="javascript:alert(1)"/></svg>`],
    ["<foreignobject", `${cab}><foreignObject/></svg>`],
    ["raya larga", `${cab}><text>a ${String.fromCharCode(0x2014)} b</text></svg>`],
    ["href externo", `${cab}><image href="http://example.com/x.png"/></svg>`],
    ["entidad", `<!DOCTYPE svg [<!ENTITY x SYSTEM "file:///etc/passwd">]>${cab}/>`],
  ];
  for (const [nombre, svg] of malos) {
    comprobar(`rechaza un SVG con ${nombre}`, motivoSvgInseguro(svg) !== null);
  }
  comprobar("densidad de un SVG de 400 px: 288 (sale a 1600 px)", densidadSvg(400) === 288);
  comprobar("densidad de un SVG enorme: nunca baja de 72", densidadSvg(5000) === DENSIDAD_BASE);
  comprobar("densidad de un SVG diminuto: tiene tope", densidadSvg(1) === DENSIDAD_MAXIMA);
  comprobar("densidad sin ancho: la base", densidadSvg(0) === DENSIDAD_BASE);
}

console.log("Imagen social, ajuste del título");
{
  const corto = ajustarTitulo("Backup 3-2-1, qué es y cómo lo aplico en empresas");
  comprobar(
    "un título corto usa el tamaño mayor y no se toca",
    corto.tamano === TAMANOS_TITULO[0] &&
      corto.texto === "Backup 3-2-1, qué es y cómo lo aplico en empresas",
  );
  const largo =
    "Cómo montar una VPN para una pyme con acceso remoto seguro, sin abrir puertos y con doble factor para todo el equipo";
  const ajustado = ajustarTitulo(largo);
  comprobar(
    "un título largo baja de tamaño y cabe en 3 líneas",
    ajustado.tamano < TAMANOS_TITULO[0] &&
      partirTitulo(ajustado.texto, ajustado.tamano).length <= MAX_LINEAS,
    `${ajustado.tamano}px, ${partirTitulo(ajustado.texto, ajustado.tamano).length} líneas`,
  );
  const enorme = ajustarTitulo(Array.from({ length: 60 }, () => "palabra").join(" "));
  comprobar(
    "un título enorme se recorta con puntos suspensivos y nunca pasa de 3 líneas",
    enorme.texto.endsWith("…") &&
      enorme.tamano === TAMANOS_TITULO[TAMANOS_TITULO.length - 1] &&
      partirTitulo(enorme.texto, enorme.tamano).length <= MAX_LINEAS,
  );
  const sinCortes = ajustarTitulo("Palabra");
  comprobar("una sola palabra no se corta", sinCortes.texto === "Palabra");
}

console.log("Conversor texto y bloques, ida y vuelta");
{
  const articulos = [ARTICULO_EJEMPLO, ...exportados];
  for (const p of articulos) {
    for (const idioma of ["es", "en"] as const) {
      const contenido: BlogPostContent = p.post[idioma];
      const texto = bloquesATexto(contenido.sections);
      const vuelta = textoABloques(texto, imagenesConocidas(contenido.sections));
      comprobar(
        `${p.slug} (${idioma}) bloques a texto y de vuelta`,
        canonico(vuelta) === canonico(contenido.sections),
        "los bloques no coinciden tras la ida y vuelta",
      );
      comprobar(
        `${p.slug} (${idioma}) texto a bloques y de vuelta`,
        bloquesATexto(vuelta) === texto,
      );
    }
  }
}

console.log(`\n${pasadas} pruebas correctas, ${fallos} con fallo.`);
process.exit(fallos === 0 ? 0 : 1);
