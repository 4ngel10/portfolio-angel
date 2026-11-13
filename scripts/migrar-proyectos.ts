/**
 * Genera db/seed-proyectos.sql a partir de lib/projects.ts y los textos portfolio.<key>Title|Tag|Desc
 * de messages/es.json y en.json. No toca Supabase: el SQL lo lanza Ángel.
 *
 *   npx tsx scripts/migrar-proyectos.ts
 *
 * No cambia ni una palabra de los textos. Las rutas de imagen se dejan como están (/projects/...).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PROJECTS, type Project } from "../lib/projects";
import type { ProyectoContent, ProyectoLocale } from "../lib/proyectos-types";

const RAIZ = join(__dirname, "..");
const SALIDA = join(RAIZ, "db", "seed-proyectos.sql");
const LOCALES = ["es", "en"] as const;

/** Proyectos cuyas cifras siguen sin validar (llevan el comentario PROVISIONAL en lib/projects.ts). */
const PROVISIONALES = new Set(["mapeo-impresoras-rds"]);

/** Páginas de servicio donde sale cada proyecto (hoy, lib/services.ts: /servicios/web lista estos dos). */
const EN_SERVICIOS: Record<string, ("web" | "sistemas")[]> = { flexgrip: ["web"], "prompt-vault": ["web"] };

type Mensajes = { portfolio: Record<string, string> };
const mensajes: Record<"es" | "en", Mensajes> = {
  es: JSON.parse(readFileSync(join(RAIZ, "messages", "es.json"), "utf8")),
  en: JSON.parse(readFileSync(join(RAIZ, "messages", "en.json"), "utf8")),
};

const errores: string[] = [];

function texto(lang: "es" | "en", clave: string): string {
  const v = mensajes[lang].portfolio[clave];
  if (typeof v !== "string" || v.trim() === "") {
    errores.push(`Falta messages/${lang}.json portfolio.${clave}`);
    return "";
  }
  return v;
}

function contenido(p: Project): ProyectoContent {
  const salida = {} as ProyectoContent;
  for (const lang of LOCALES) {
    const loc: ProyectoLocale = {
      title: texto(lang, `${p.key}Title`),
      tag: texto(lang, `${p.key}Tag`),
      desc: texto(lang, `${p.key}Desc`),
      post: p.post[lang],
      facts: p.facts?.[lang] ?? [],
    };
    if (p.coverAlt?.[lang]) loc.coverAlt = p.coverAlt[lang];
    if (p.caseStudy?.[lang]) loc.caseStudy = p.caseStudy[lang];
    if (!p.facts?.[lang]) errores.push(`${p.slug}: faltan facts en ${lang}`);
    salida[lang] = loc;
  }
  return salida;
}

/** Rutas de imagen que usa un proyecto: portadas, imagen social y las del cuerpo de los artículos. */
function imagenes(p: Project): string[] {
  const rutas = [p.image, p.imageDark, p.ogImage].filter((r): r is string => !!r);
  for (const lang of LOCALES) {
    for (const sec of p.post[lang].sections) {
      for (const b of sec.blocks) {
        if (typeof b === "object" && "img" in b) rutas.push(b.img);
      }
    }
  }
  return rutas;
}

function comprobarImagen(slug: string, ruta: string) {
  // /blog-img y similares no existen en public/; los proyectos solo usan /projects/...
  const archivo = join(RAIZ, "public", ruta.startsWith("/") ? ruta.slice(1) : ruta);
  if (!existsSync(archivo)) errores.push(`${slug}: no existe public${ruta}`);
}

const sql = (v: string | null | undefined) => (v == null ? "null" : `'${v.split("'").join("''")}'`);

function arraySql(v: string[]): string {
  return `array[${v.map((x) => sql(x)).join(", ")}]::text[]`;
}

const filas: string[] = [];
const resumen: string[] = [];

PROJECTS.forEach((p, i) => {
  const orden = (i + 1) * 10;
  for (const ruta of imagenes(p)) comprobarImagen(p.slug, ruta);
  if (!p.date) errores.push(`${p.slug}: sin date`);

  const json = JSON.stringify(contenido(p));
  const etiqueta = `proy_${p.slug.split("-").join("_")}`;
  if (json.includes(`$${etiqueta}$`))
    errores.push(`${p.slug}: la etiqueta de dollar-quoting aparece en el texto`);

  const provisional = PROVISIONALES.has(p.slug);
  filas.push(`-- ${i + 1}. ${p.slug}
insert into public.portfolio_projects
  (slug, status, published_at, orden, service, tech, cover, tint, url, image, image_dark, og_image,
   cover_position, en_servicios, ejemplo, datos_provisionales, content, created_by)
values (
  ${sql(p.slug)}, 'publicado', ('${p.date} 09:00:00'::timestamp at time zone 'Europe/Madrid'), ${orden},
  ${sql(p.service)}, ${arraySql(p.tech)}, ${sql(p.cover)}, ${p.tint}, ${sql(p.url)}, ${sql(p.image)},
  ${sql(p.imageDark)}, ${sql(p.ogImage)}, ${sql(p.coverPosition)}, ${arraySql(EN_SERVICIOS[p.slug] ?? [])}, false, ${provisional},
  $${etiqueta}$${json}$${etiqueta}$::jsonb,
  'migracion'
)
on conflict (slug) do update set
  status = excluded.status, published_at = excluded.published_at, orden = excluded.orden,
  service = excluded.service, tech = excluded.tech, cover = excluded.cover, tint = excluded.tint,
  url = excluded.url, image = excluded.image, image_dark = excluded.image_dark,
  og_image = excluded.og_image, cover_position = excluded.cover_position, en_servicios = excluded.en_servicios,
  ejemplo = excluded.ejemplo, datos_provisionales = excluded.datos_provisionales,
  content = excluded.content, updated_at = now();
`);
  resumen.push(
    `${String(orden).padStart(3)}  ${p.slug.padEnd(26)} ${p.service.padEnd(9)} ${p.date}  ${imagenes(p).length} imágenes${provisional ? "  PROVISIONAL" : ""}`,
  );
});

if (errores.length > 0) {
  console.error("Errores, no se escribe el SQL:\n" + errores.map((e) => "  - " + e).join("\n"));
  process.exit(1);
}

const cabecera = `-- Seed de los proyectos del portfolio. Generado por scripts/migrar-proyectos.ts, no lo edites a mano.
-- Se lanza una sola vez, después de la migración 0011 y de db/rls.sql.
-- ATENCIÓN: "on conflict do update" pisa lo que hayas editado en el panel. Si el panel ya está en
-- uso, no vuelvas a lanzarlo.
`;
writeFileSync(SALIDA, cabecera + "\n" + filas.join("\n"), "utf8");

console.log(`Escrito ${SALIDA}\n`);
console.log("orden slug                       servicio  fecha       imágenes");
console.log(resumen.join("\n"));
console.log(`\n${PROJECTS.length} proyectos, todas las imágenes existen en public/.`);
