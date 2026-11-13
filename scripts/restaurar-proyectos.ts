/**
 * Genera el SQL para restaurar el portfolio desde la copia de seguridad que descarga el panel
 * (/admin/portfolio, "Exportar todo (JSON)"). No toca Supabase: el SQL lo lanza Ángel en el editor
 * de SQL de Supabase.
 *
 *   npx tsx scripts/restaurar-proyectos.ts <copia.json> [salida.sql] [--versiones]
 *
 * Por defecto escribe db/restaurar-proyectos.sql (ignorado por git: lleva los textos reales).
 * Cada proyecto es un `insert ... on conflict (id) do update`, así que repone los que falten y
 * deja los demás como estaban en la copia. Con --versiones incluye también el historial.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

type Fila = Record<string, unknown>;

const args = process.argv.slice(2);
const conVersiones = args.includes("--versiones");
const [entrada, salida = join(__dirname, "..", "db", "restaurar-proyectos.sql")] = args.filter(
  (a) => !a.startsWith("--"),
);
if (!entrada) {
  console.error(
    "Uso: npx tsx scripts/restaurar-proyectos.ts <copia.json> [salida.sql] [--versiones]",
  );
  process.exit(1);
}

const json = JSON.parse(readFileSync(entrada, "utf8")) as {
  proyectos?: Fila[];
  versiones?: Fila[];
};
const proyectos = json.proyectos ?? [];
const versiones = json.versiones ?? [];
if (proyectos.length === 0) {
  console.error('La copia no trae proyectos (falta la clave "proyectos").');
  process.exit(1);
}

const errores: string[] = [];
const texto = (v: unknown) =>
  v === null || v === undefined ? "null" : `'${String(v).split("'").join("''")}'`;
const numero = (v: unknown, donde: string) => {
  if (typeof v !== "number" || !Number.isFinite(v)) errores.push(`${donde}: no es un número`);
  return String(v);
};
const booleano = (v: unknown) => (v === true ? "true" : "false");
const lista = (v: unknown) =>
  Array.isArray(v) ? `array[${v.map((x) => texto(x)).join(", ")}]::text[]` : "array[]::text[]";
/** jsonb entre dollar-quotes con una etiqueta que no aparezca en el texto. */
function jsonb(v: unknown, etiqueta: string) {
  const cuerpo = JSON.stringify(v);
  let marca = etiqueta;
  while (cuerpo.includes(`$${marca}$`)) marca += "x";
  return `$${marca}$${cuerpo}$${marca}$::jsonb`;
}

const COLUMNAS = [
  "id",
  "slug",
  "status",
  "published_at",
  "orden",
  "service",
  "tech",
  "cover",
  "tint",
  "url",
  "image",
  "image_dark",
  "og_image",
  "cover_position",
  "en_servicios",
  "ejemplo",
  "datos_provisionales",
  "content",
  "created_by",
  "created_at",
  "updated_at",
];

const partes: string[] = [
  "-- Restauración del portfolio desde una copia de seguridad (scripts/restaurar-proyectos.ts).",
  "-- Lanzar en el editor de SQL de Supabase. Lleva los textos reales: no lo subas a git.",
  "begin;",
  "",
];

proyectos.forEach((p, i) => {
  const donde = `proyecto ${i + 1} (${String(p.slug)})`;
  for (const c of [
    "id",
    "slug",
    "status",
    "orden",
    "service",
    "cover",
    "tint",
    "content",
    "created_by",
  ]) {
    if (p[c] === undefined || p[c] === null) errores.push(`${donde}: falta ${c}`);
  }
  const valores = [
    texto(p.id),
    texto(p.slug),
    texto(p.status),
    texto(p.published_at),
    numero(p.orden, donde),
    texto(p.service),
    lista(p.tech),
    texto(p.cover),
    numero(p.tint, donde),
    texto(p.url),
    texto(p.image),
    texto(p.image_dark),
    texto(p.og_image),
    texto(p.cover_position),
    lista(p.en_servicios),
    booleano(p.ejemplo),
    booleano(p.datos_provisionales),
    jsonb(p.content, "proy"),
    texto(p.created_by),
    texto(p.created_at),
    texto(p.updated_at),
  ];
  const actualiza = COLUMNAS.filter((c) => c !== "id").map((c) => `${c} = excluded.${c}`);
  partes.push(
    `-- ${i + 1}. ${String(p.slug)}`,
    `insert into public.portfolio_projects (${COLUMNAS.join(", ")})`,
    `values (${valores.join(", ")})`,
    `on conflict (id) do update set ${actualiza.join(", ")};`,
    "",
  );
});

if (conVersiones) {
  const ids = new Set(proyectos.map((p) => p.id));
  const aplicables = versiones.filter((v) => ids.has(v.project_id));
  partes.push(`-- Historial de versiones (${aplicables.length}).`);
  for (const v of aplicables) {
    partes.push(
      "insert into public.portfolio_project_versions (id, project_id, content, created_at)",
      `values (${texto(v.id)}, ${texto(v.project_id)}, ${jsonb(v.content, "ver")}, ${texto(v.created_at)})`,
      "on conflict (id) do nothing;",
    );
  }
  partes.push("");
}

partes.push("commit;", "");

if (errores.length > 0) {
  console.error(
    "La copia no es válida, no se escribe el SQL:\n" + errores.map((e) => `  - ${e}`).join("\n"),
  );
  process.exit(1);
}

writeFileSync(salida, partes.join("\n"), "utf8");
console.log(
  `Escrito ${salida}: ${proyectos.length} proyectos${conVersiones ? ` y ${versiones.filter((v) => proyectos.some((p) => p.id === v.project_id)).length} versiones` : ""}.`,
);
