/**
 * Migra el blog de lib/blog.ts (BLOG_POSTS) a Supabase.
 *
 *   npx tsx scripts/migrar-blog.ts            genera db/seed-blog.sql (modo seguro, no toca nada)
 *   npx tsx scripts/migrar-blog.ts --subir    además sube las imágenes al bucket "blog"
 *
 * El SQL se lanza a mano en el SQL Editor de Supabase. Las imágenes se suben con
 * SUPABASE_SERVICE_ROLE_KEY de .env.local (nunca se imprime).
 *
 * Imágenes: /blog/<slug>/<archivo> pasa a /blog-img/<slug>/<archivo> (la web las sirve por su
 * dominio con un rewrite hacia el bucket) y la imagen para redes es /blog-img/<slug>/og.jpg.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import { BLOG_POSTS, type BlogPostContent } from "../lib/blog";

const RAIZ = process.cwd();
const PUBLIC = path.join(RAIZ, "public");
const SALIDA = path.join(RAIZ, "db", "seed-blog.sql");
const BUCKET = "blog";
const subir = process.argv.includes("--subir");

const TIPOS: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

const errores: string[] = [];
const comillas = (texto: string) => `'${texto.split("'").join("''")}'`;

/** Desfase de Madrid en esa fecha (+01:00 en invierno, +02:00 en verano). */
function desfaseMadrid(fecha: string): string {
  const nombre =
    new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Madrid", timeZoneName: "longOffset" })
      .formatToParts(new Date(`${fecha}T09:00:00Z`))
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  // "GMT+1" o "GMT+02:00"; "GMT" a secas no puede darse en Madrid.
  const numero = nombre.replace("GMT", "");
  const signo = numero.startsWith("-") ? "-" : "+";
  const [horas, minutos = "00"] = numero.replace("+", "").replace("-", "").split(":");
  return `${signo}${horas.padStart(2, "0")}:${minutos}`;
}

type Imagen = { original: string; reescrita: string };
const imagenes: Imagen[] = [];

/** Copia del contenido con las rutas de imagen de /blog/<slug>/ a /blog-img/<slug>/. */
function reescribir(slug: string, contenido: BlogPostContent, idioma: string): BlogPostContent {
  const copia = structuredClone(contenido);
  const prefijo = `/blog/${slug}/`;
  for (const seccion of copia.sections) {
    for (const bloque of seccion.blocks) {
      if (typeof bloque === "string" || !("img" in bloque)) continue;
      const donde = `${slug} (${idioma})`;
      if (!bloque.img.startsWith(prefijo)) {
        errores.push(`${donde}: la imagen ${bloque.img} no está en ${prefijo}`);
        continue;
      }
      if (!existsSync(path.join(PUBLIC, bloque.img))) {
        errores.push(`${donde}: no existe el archivo public${bloque.img}`);
      }
      if (!bloque.alt) errores.push(`${donde}: la imagen ${bloque.img} no tiene alt`);
      if (!bloque.width || !bloque.height) {
        errores.push(`${donde}: la imagen ${bloque.img} no tiene width y height`);
      }
      const reescrita = bloque.img.replace(prefijo, `/blog-img/${slug}/`);
      imagenes.push({ original: bloque.img, reescrita });
      bloque.img = reescrita;
    }
  }
  return copia;
}

const lineas: string[] = [
  "-- Migración del blog (generada por scripts/migrar-blog.ts, no editar a mano).",
  "-- Se lanza UNA vez en el SQL Editor de Supabase, después de la migración 0009, de",
  "-- db/rls.sql y de subir las imágenes (npx tsx scripts/migrar-blog.ts --subir).",
  "-- OJO: repetirla sobreescribe lo que hayas editado desde el panel en estos artículos.",
  "begin;",
  "",
];

for (const post of BLOG_POSTS) {
  const fechaPublicacion = `${post.date}T09:00:00${desfaseMadrid(post.date)}`;
  const contenido = {
    es: reescribir(post.slug, post.post.es, "es"),
    en: reescribir(post.slug, post.post.en, "en"),
  };
  const json = JSON.stringify(contenido);
  const etiqueta = `$blog_${createHash("sha1").update(post.slug).digest("hex").slice(0, 8)}$`;
  if (json.includes(etiqueta))
    errores.push(`${post.slug}: el contenido contiene la etiqueta ${etiqueta}`);

  const original = path.join(PUBLIC, post.ogImage);
  if (!existsSync(original))
    errores.push(`${post.slug}: no existe la imagen para redes public${post.ogImage}`);

  const ts = `${comillas(fechaPublicacion)}::timestamptz`;
  lineas.push(
    `-- ${post.slug}`,
    "insert into public.blog_posts",
    "  (slug, category, status, published_at, content, og_image, created_by, created_at, updated_at)",
    "values (",
    `  ${comillas(post.slug)}, ${comillas(post.category)}, 'publicado', ${ts},`,
    `  ${etiqueta}${json}${etiqueta}::jsonb,`,
    `  ${comillas(`/blog-img/${post.slug}/og.jpg`)}, 'migracion', ${ts}, ${ts}`,
    ")",
    "on conflict (slug) do update set",
    "  category = excluded.category, status = excluded.status, published_at = excluded.published_at,",
    "  content = excluded.content, og_image = excluded.og_image, updated_at = excluded.updated_at;",
    "",
  );
}
lineas.push("commit;", "");

/** Archivos a subir: public/blog/<slug>/* tal cual y <slug>-og.jpg como <slug>/og.jpg. */
type Subida = { desde: string; destino: string; bytes: number };
const subidas: Subida[] = [];
for (const post of BLOG_POSTS) {
  const carpeta = path.join(PUBLIC, "blog", post.slug);
  if (existsSync(carpeta)) {
    for (const archivo of readdirSync(carpeta).sort()) {
      const desde = path.join(carpeta, archivo);
      if (statSync(desde).isFile()) {
        subidas.push({ desde, destino: `${post.slug}/${archivo}`, bytes: statSync(desde).size });
      }
    }
  }
  const og = path.join(PUBLIC, post.ogImage);
  if (existsSync(og)) {
    subidas.push({ desde: og, destino: `${post.slug}/og.jpg`, bytes: statSync(og).size });
  }
}

if (errores.length > 0) {
  console.error("Hay problemas, no se genera nada:");
  for (const e of errores) console.error(`  - ${e}`);
  process.exit(1);
}

writeFileSync(SALIDA, lineas.join("\n"), "utf8");

const kb = (n: number) => `${(n / 1024).toFixed(1)} KB`;
const totalBytes = subidas.reduce((s, x) => s + x.bytes, 0);
const rutasUnicas = new Set(imagenes.map((i) => i.original));
console.log(`Artículos: ${BLOG_POSTS.length}`);
console.log(
  `Imágenes en el contenido: ${imagenes.length} (${rutasUnicas.size} archivos distintos), todas existen en public/blog`,
);
console.log(`Archivos a subir al bucket "${BUCKET}": ${subidas.length} (${kb(totalBytes)})`);
console.log(`SQL generado: ${path.relative(RAIZ, SALIDA)}`);

if (!subir) {
  console.log("Modo seguro: no se ha subido nada. Añade --subir para subir las imágenes.");
  process.exit(0);
}

async function subirImagenes() {
  try {
    process.loadEnvFile(path.join(RAIZ, ".env.local"));
  } catch {
    // Sin archivo: se usan las variables del entorno.
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !clave) {
    console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local.");
    process.exit(1);
  }
  const supabase = createClient(url, clave, { auth: { persistSession: false } });
  let hechas = 0;
  for (const s of subidas) {
    const tipo = TIPOS[path.extname(s.desde).toLowerCase()];
    if (!tipo) {
      console.error(`Tipo no admitido: ${s.destino}`);
      process.exit(1);
    }
    const { error } = await supabase.storage.from(BUCKET).upload(s.destino, readFileSync(s.desde), {
      contentType: tipo,
      upsert: true,
      cacheControl: "86400",
    });
    if (error) {
      console.error(`Fallo al subir ${s.destino}: ${error.message}`);
      process.exit(1);
    }
    hechas++;
  }
  console.log(`Subidos ${hechas} archivos (${kb(totalBytes)}) al bucket "${BUCKET}".`);
}

void subirImagenes();
