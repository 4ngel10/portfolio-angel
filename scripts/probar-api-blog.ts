/**
 * Pruebas de la API del blog (app/api/blog) contra un servidor en marcha.
 *
 *   npm run dev            (en otra terminal)
 *   npx tsx --env-file=.env.local scripts/probar-api-blog.ts [http://localhost:3000]
 *
 * OJO: usa la base de datos a la que apunte .env.local (producción). Crea sus propias claves de
 * prueba y artículos con el prefijo "zz-prueba-api-", NO publica nada (el caso del 409 usa un
 * artículo programado a un año vista, que la web no enseña) y al terminar borra todo lo que
 * creó, también si una prueba falla. Necesita antes la migración 0010 (tabla blog_api_uso).
 */
import { createHash, randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const URL_SUPABASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const CLAVE_SERVICIO = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL_SUPABASE || !CLAVE_SERVICIO) {
  console.error(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY (usa --env-file=.env.local).",
  );
  process.exit(2);
}

const db = createClient(URL_SUPABASE, CLAVE_SERVICIO, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const sha256 = (t: string) => createHash("sha256").update(t).digest("hex");
const nuevaClave = () => `blg_${randomBytes(32).toString("base64url")}`;

const sufijo = randomBytes(3).toString("hex");
const SLUG_A = `zz-prueba-api-${sufijo}-a`;
const SLUG_B = `zz-prueba-api-${sufijo}-b`;
const SLUGS = [SLUG_A, SLUG_B];

const resultados: { caso: string; ok: boolean; detalle: string }[] = [];
function anotar(caso: string, ok: boolean, detalle: string) {
  resultados.push({ caso, ok, detalle });
  console.log(`${ok ? "OK    " : "FALLA "} ${caso}${detalle ? ` (${detalle})` : ""}`);
}

type Resp = { status: number; json: Record<string, unknown> | null };

async function llamar(
  ruta: string,
  init: {
    metodo?: string;
    clave?: string;
    json?: unknown;
    form?: FormData;
    /** Pide cerrar la conexión al terminar: para los casos que esperan un rechazo (400, 413, 415, 422). */
    cerrar?: boolean;
  },
): Promise<Resp> {
  const headers: Record<string, string> = {};
  if (init.clave) headers.Authorization = `Bearer ${init.clave}`;
  if (init.cerrar) headers.Connection = "close";
  let body: BodyInit | undefined;
  if (init.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.json);
  } else if (init.form) {
    body = init.form;
  }
  const metodo = init.metodo ?? "GET";
  let res: Response;
  try {
    res = await fetch(`${BASE}${ruta}`, { method: metodo, headers, body });
  } catch (primero) {
    // Un GET no cambia nada, así que se reintenta una vez (típico de una conexión que el
    // servidor ya había cerrado). Una escritura no se reintenta: repetirla podría duplicarla.
    if (metodo === "GET") {
      console.log(`  (error de red en GET ${ruta}: ${(primero as Error).message}, reintento)`);
      try {
        res = await fetch(`${BASE}${ruta}`, { method: metodo, headers, body });
      } catch (segundo) {
        console.log(`  (el reintento también falló: ${(segundo as Error).message})`);
        return { status: 0, json: null };
      }
    } else {
      // No debe tumbar el resto de casos: cuenta como estado 0 y falla el suyo.
      console.log(`  (error de red en ${metodo} ${ruta}: ${(primero as Error).message})`);
      return { status: 0, json: null };
    }
  }
  const texto = await res.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(texto) as Record<string, unknown>;
  } catch {
    json = null;
  }
  return { status: res.status, json };
}

function formImagen(slug: string, nombre: string, bytes: Buffer, tipo: string): FormData {
  const f = new FormData();
  f.set("slug", slug);
  f.set("nombre", nombre);
  f.set("archivo", new Blob([new Uint8Array(bytes)], { type: tipo }), `${nombre}.bin`);
  return f;
}

async function png(color: string): Promise<Buffer> {
  return sharp({ create: { width: 1200, height: 600, channels: 3, background: color } })
    .png()
    .toBuffer();
}

/** Contenido de un idioma que pasa el comprobador de publicar, con las dos imágenes ya subidas. */
function contenido(idioma: "es" | "en", rutas: string[], descripcion?: string) {
  const es = idioma === "es";
  const d =
    descripcion ??
    (es
      ? "Artículo de prueba de la API del blog, creado por el script de pruebas y borrado al terminar, no es contenido real ni se publica."
      : "Test article for the blog API, created by the test script and deleted when it ends, it is not real content and is never published.");
  return {
    title: es ? "Artículo de prueba de la API" : "API test article",
    excerpt: es ? "Resumen de prueba." : "Test summary.",
    description: d,
    intro: es
      ? "Este artículo existe solo para probar la API y se borra al terminar."
      : "This article exists only to test the API and is deleted afterwards.",
    sections: [
      {
        heading: es ? "Primera sección" : "First section",
        blocks: [
          es
            ? "Texto de prueba con un enlace a [sistemas](/servicios/sistemas)."
            : "Test text with a link to [systems](/servicios/sistemas).",
          { img: rutas[0], alt: es ? "Imagen de prueba roja" : "Red test image" },
        ],
      },
      {
        heading: es ? "Segunda sección" : "Second section",
        blocks: [
          es ? "Más texto de prueba." : "More test text.",
          { img: rutas[1], alt: es ? "Imagen de prueba azul" : "Blue test image" },
        ],
      },
    ],
  };
}

async function limpiar(tokenIds: string[]) {
  for (const slug of SLUGS) {
    const { data } = await db.storage.from("blog").list(slug);
    if (data && data.length > 0) {
      await db.storage.from("blog").remove(data.map((o) => `${slug}/${o.name}`));
    }
  }
  await db.from("blog_posts").delete().in("slug", SLUGS); // las versiones caen en cascada
  if (tokenIds.length > 0) await db.from("blog_api_tokens").delete().in("id", tokenIds); // y su uso
}

async function main() {
  const tokenIds: string[] = [];
  try {
    // Dos claves de prueba, una activa y otra revocada.
    const activa = nuevaClave();
    const revocada = nuevaClave();
    const { data: filas, error } = await db
      .from("blog_api_tokens")
      .insert([
        { nombre: "prueba-script", token_hash: sha256(activa), scope: "borrador" },
        {
          nombre: "prueba-script-revocada",
          token_hash: sha256(revocada),
          scope: "borrador",
          revoked_at: new Date().toISOString(),
        },
      ])
      .select("id, nombre");
    if (error || !filas)
      throw new Error(`No se pudieron crear las claves de prueba: ${error?.message}`);
    for (const f of filas) tokenIds.push(f.id as string);
    const idActiva = filas.find((f) => f.nombre === "prueba-script")?.id as string;

    // 1. Sin clave.
    const sin = await llamar("/api/blog/posts", {});
    const sinPut = await llamar(`/api/blog/posts/${SLUG_A}`, { metodo: "PUT", json: {} });
    anotar(
      "1. sin clave da 401",
      sin.status === 401 && sinPut.status === 401,
      `GET ${sin.status}, PUT ${sinPut.status}`,
    );

    // 2. Clave revocada.
    const rev = await llamar("/api/blog/posts", { clave: revocada });
    const mala = await llamar("/api/blog/posts", { clave: "blg_clave-que-no-existe" });
    anotar(
      "2. clave revocada o falsa da 401",
      rev.status === 401 && mala.status === 401,
      `revocada ${rev.status}, falsa ${mala.status}`,
    );

    // Imágenes que necesitan los artículos (también prueban la subida).
    const roja = await llamar("/api/blog/imagenes", {
      metodo: "POST",
      clave: activa,
      form: formImagen(SLUG_A, "roja", await png("#c2410c"), "image/png"),
    });
    const azul = await llamar("/api/blog/imagenes", {
      metodo: "POST",
      clave: activa,
      form: formImagen(SLUG_A, "azul", await png("#1d4ed8"), "image/png"),
    });
    const rutas = [roja.json?.ruta as string, azul.json?.ruta as string];
    anotar(
      "7a. un PNG válido se sube y se convierte a WebP",
      roja.status === 200 &&
        azul.status === 200 &&
        rutas.every((r) => typeof r === "string" && r.endsWith(".webp")),
      `${roja.status}, ${rutas[0]}, ${roja.json?.width}x${roja.json?.height}`,
    );
    if (!rutas.every((r) => typeof r === "string"))
      throw new Error("Sin imágenes no se pueden probar los artículos.");

    // 3. Description de 100 caracteres.
    const corta = await llamar(`/api/blog/posts/${SLUG_A}`, {
      metodo: "PUT",
      clave: activa,
      cerrar: true,
      json: {
        category: "sistemas",
        es: contenido("es", rutas, "a".repeat(100)),
        en: contenido("en", rutas),
      },
    });
    const rutasErr = ((corta.json?.errores as { ruta: string }[] | undefined) ?? []).map(
      (e) => e.ruta,
    );
    anotar(
      "3. description de 100 caracteres da 422 con la ruta",
      corta.status === 422 && rutasErr.includes("es.description"),
      `${corta.status}, ${rutasErr.join(" ")}`,
    );

    // 4. Borrador válido: 200, es borrador y no sale en la web.
    const ok = await llamar(`/api/blog/posts/${SLUG_A}`, {
      metodo: "PUT",
      clave: activa,
      json: { category: "sistemas", es: contenido("es", rutas), en: contenido("en", rutas) },
    });
    const { data: fila } = await db
      .from("blog_posts")
      .select("status, created_by")
      .eq("slug", SLUG_A)
      .maybeSingle();
    const lista = await llamar("/api/blog/posts", { clave: activa });
    const enLista = (
      (lista.json?.posts as { slug: string; status: string }[] | undefined) ?? []
    ).find((p) => p.slug === SLUG_A);
    const html = await (await fetch(`${BASE}/blog`)).text();
    const mapa = await (await fetch(`${BASE}/sitemap.xml`)).text();
    const publica = await fetch(`${BASE}/blog/${SLUG_A}`);
    anotar(
      "4a. un borrador válido da 200 y queda como borrador con created_by api:",
      ok.status === 200 &&
        fila?.status === "borrador" &&
        fila.created_by === "api:prueba-script" &&
        enLista?.status === "borrador",
      `${ok.status}, estado ${fila?.status}, created_by ${fila?.created_by}, en GET ${enLista?.status}`,
    );
    anotar(
      "4b. no aparece en /blog, ni en el sitemap, ni en su URL pública",
      !html.includes(SLUG_A) && !mapa.includes(SLUG_A) && publica.status === 404,
      `/blog ${html.includes(SLUG_A) ? "SÍ" : "no"}, sitemap ${mapa.includes(SLUG_A) ? "SÍ" : "no"}, URL ${publica.status}`,
    );

    // Editar el mismo borrador otra vez es válido (200), sin duplicar.
    const otra = await llamar(`/api/blog/posts/${SLUG_A}`, {
      metodo: "PUT",
      clave: activa,
      json: { category: "sistemas", es: contenido("es", rutas), en: contenido("en", rutas) },
    });
    const { count } = await db
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("slug", SLUG_A);
    anotar(
      "4c. repetir el PUT actualiza el mismo borrador",
      otra.status === 200 && otra.json?.creado === false && count === 1,
      `${otra.status}, filas ${count}`,
    );

    // 5. Publicado: 409. Se deja "programado" a un año vista para que la web no lo enseñe.
    await db
      .from("blog_posts")
      .update({
        status: "publicado",
        published_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      })
      .eq("slug", SLUG_A);
    const pub = await llamar(`/api/blog/posts/${SLUG_A}`, {
      metodo: "PUT",
      clave: activa,
      json: { category: "sistemas", es: contenido("es", rutas), en: contenido("en", rutas) },
    });
    anotar("5. editar un artículo publicado da 409", pub.status === 409, `${pub.status}`);

    // 6. SVG peligrosos: todos tienen que dar 4xx y no guardar nada.
    const cabecera = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"';
    const peligrosos: [string, string][] = [
      ["script", `${cabecera}><script>alert(1)</script></svg>`],
      ["onload", `${cabecera} onload="alert(1)"></svg>`],
      [
        "javascript:",
        `${cabecera}><a href="javascript:alert(1)"><rect width="5" height="5"/></a></svg>`,
      ],
      ["foreignObject", `${cabecera}><foreignObject><div/></foreignObject></svg>`],
      ["raya larga", `${cabecera}><text>uno ${String.fromCharCode(0x2014)} dos</text></svg>`],
      ["recurso externo", `${cabecera}><image href="http://example.com/x.png"/></svg>`],
    ];
    const estados: string[] = [];
    let todosRechazados = true;
    for (const [nombre, svg] of peligrosos) {
      const r = await llamar("/api/blog/imagenes", {
        metodo: "POST",
        clave: activa,
        cerrar: true,
        form: formImagen(SLUG_B, `malo-${nombre.length}`, Buffer.from(svg), "image/svg+xml"),
      });
      estados.push(`${nombre} ${r.status}`);
      if (r.status < 400 || r.status >= 500) todosRechazados = false;
    }
    const { data: tras } = await db.storage.from("blog").list(SLUG_B);
    anotar(
      "6. un SVG con script, onload, javascript:, foreignObject, raya larga o recurso externo da 4xx y no se guarda",
      todosRechazados && (tras ?? []).length === 0,
      `${estados.join(", ")}, archivos guardados ${(tras ?? []).length}`,
    );

    // 7. Resto de imágenes. Un SVG limpio se convierte: sale un WebP de unos 1600 px.
    const bueno = await llamar("/api/blog/imagenes", {
      metodo: "POST",
      clave: activa,
      form: formImagen(
        SLUG_B,
        "limpio",
        Buffer.from(
          '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="#c2410c"/></svg>',
        ),
        "image/svg+xml",
      ),
    });
    const repetida = await llamar("/api/blog/imagenes", {
      metodo: "POST",
      clave: activa,
      form: formImagen(SLUG_A, "roja", await png("#000000"), "image/png"),
    });
    const grande = await llamar("/api/blog/imagenes", {
      metodo: "POST",
      clave: activa,
      cerrar: true,
      form: formImagen(SLUG_B, "grande", Buffer.alloc(5 * 1024 * 1024, 1), "image/png"),
    });
    const texto = await llamar("/api/blog/imagenes", {
      metodo: "POST",
      clave: activa,
      cerrar: true,
      form: formImagen(SLUG_B, "texto", Buffer.from("hola"), "text/plain"),
    });
    const rutaSvg = String(bueno.json?.ruta);
    const ancho = Number(bueno.json?.width);
    const { data: guardados } = await db.storage.from("blog").list(SLUG_B);
    const nombres = (guardados ?? []).map((o) => o.name);
    anotar(
      "7b. un SVG limpio se convierte a WebP de unos 1600 px y no queda ningún .svg en el bucket",
      bueno.status === 200 &&
        rutaSvg.endsWith(".webp") &&
        ancho >= 1500 &&
        ancho <= 2200 &&
        nombres.length > 0 &&
        nombres.every((n) => n.endsWith(".webp")),
      `${bueno.status}, ${rutaSvg}, ${bueno.json?.width}x${bueno.json?.height}, archivos ${nombres.join(" ")}`,
    );
    anotar(
      "7c. un nombre repetido da 409 y no sobrescribe",
      repetida.status === 409,
      `${repetida.status}`,
    );
    anotar("7d. más de 4 MB da 413", grande.status === 413, `${grande.status}`);
    anotar("7e. un tipo no admitido da 415", texto.status === 415, `${texto.status}`);

    // 9b. Slug no válido: se manda un borrador mínimo y válido, así lo único malo es el slug. Va
    // antes que el 9a para no reutilizar la conexión que el 413 deja cerrada.
    const SLUG_MALO = "Slug-Con-Mayusculas";
    const slugMalo = await llamar(`/api/blog/posts/${SLUG_MALO}`, {
      metodo: "PUT",
      clave: activa,
      cerrar: true,
      json: { category: "sistemas", es: contenido("es", rutas), en: contenido("en", rutas) },
    });
    const tras9b = await llamar("/api/blog/posts", { clave: activa });
    const slugsTras9b = ((tras9b.json?.posts as { slug: string }[] | undefined) ?? []).map((p) =>
      p.slug.toLowerCase(),
    );
    const creado = slugsTras9b.includes(SLUG_MALO.toLowerCase());
    anotar(
      "9b. un slug no válido da 400 y no crea nada",
      slugMalo.status === 400 && tras9b.status === 200 && !creado,
      `PUT ${slugMalo.status}, GET ${tras9b.status}, creado ${creado ? "SÍ" : "no"}`,
    );

    // 9a. Cuerpo enorme (antes del límite por hora, que se comprueba primero).
    const enorme = await llamar(`/api/blog/posts/${SLUG_B}`, {
      metodo: "PUT",
      clave: activa,
      cerrar: true,
      json: { relleno: "x".repeat(450_000) },
    });
    anotar("9a. un JSON de más de 400 KB da 413", enorme.status === 413, `${enorme.status}`);

    // 8. Límite por hora: 20 escrituras de artículo ya anotadas, la siguiente da 429.
    await db
      .from("blog_api_uso")
      .insert(Array.from({ length: 20 }, () => ({ token_id: idActiva, tipo: "articulo" })));
    const limite = await llamar(`/api/blog/posts/${SLUG_B}`, {
      metodo: "PUT",
      clave: activa,
      json: { category: "sistemas", es: contenido("es", rutas), en: contenido("en", rutas) },
    });
    anotar("8. pasarse del límite por hora da 429", limite.status === 429, `${limite.status}`);
  } finally {
    await limpiar(tokenIds);
    const { count } = await db
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .in("slug", SLUGS);
    console.log(`\nLimpieza hecha, quedan ${count ?? "?"} artículos de prueba.`);
  }

  const fallos = resultados.filter((r) => !r.ok).length;
  console.log(`${resultados.length - fallos} correctos, ${fallos} con fallo.`);
  process.exit(fallos === 0 ? 0 : 1);
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
