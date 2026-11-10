/**
 * Pruebas del comprobador (lib/blog-validate.ts) y del conversor (lib/blog-markup.ts).
 *
 *   npm test        (o: npx tsx scripts/probar-blog.ts)
 *
 * Sale con código 1 si falla algo. Usa los 5 artículos reales de lib/blog.ts.
 */
import { BLOG_POSTS } from "../lib/blog";
import { bloquesATexto, imagenesConocidas, textoABloques } from "../lib/blog-markup";
import { validarPost, type PostParaValidar } from "../lib/blog-validate";
import type { BlogPostContent } from "../lib/blog-types";

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

function paraValidar(i: number): PostParaValidar {
  const p = BLOG_POSTS[i];
  return { slug: p.slug, category: p.category, ogImage: p.ogImage, es: p.post.es, en: p.post.en };
}

/** Texto de relleno con el largo exacto que se pide. */
function conLargo(n: number): string {
  return "a".repeat(n);
}

console.log("Validador, artículos reales");
// Las reglas nuevas son más estrictas que los textos antiguos. Uno tiene que pasar limpio (prueba
// de que no rechaza un artículo bueno) y de los demás se informa sin fallar.
BLOG_POSTS.forEach((p, i) => {
  const r = validarPost({ ...paraValidar(i), creadoPor: "migracion" }, { publicar: true });
  const detalle = r.errores.map((e) => `${e.ruta}: ${e.mensaje}`).join(" | ");
  if (p.slug === "mantenimiento-web-pyme") {
    comprobar(`${p.slug} se acepta sin errores`, r.errores.length === 0, detalle);
  } else {
    console.log(`  info ${p.slug}: ${r.errores.length} errores${detalle ? ` (${detalle})` : ""}`);
  }
});

console.log("Validador, casos que debe detectar");
{
  const base = paraValidar(0);

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

console.log("Conversor texto y bloques, ida y vuelta");
BLOG_POSTS.forEach((p) => {
  for (const idioma of ["es", "en"] as const) {
    const contenido: BlogPostContent = p.post[idioma];
    const texto = bloquesATexto(contenido.sections);
    const vuelta = textoABloques(texto, imagenesConocidas(contenido.sections));
    comprobar(
      `${p.slug} (${idioma}) bloques a texto y de vuelta`,
      JSON.stringify(vuelta) === JSON.stringify(contenido.sections),
      "los bloques no coinciden tras la ida y vuelta",
    );
    comprobar(`${p.slug} (${idioma}) texto a bloques y de vuelta`, bloquesATexto(vuelta) === texto);
  }
});

console.log(`\n${pasadas} pruebas correctas, ${fallos} con fallo.`);
process.exit(fallos === 0 ? 0 : 1);
