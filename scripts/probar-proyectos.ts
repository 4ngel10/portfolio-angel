/**
 * Pruebas de los proyectos del portfolio:
 *
 * 1. El comprobador (lib/proyectos-validate.ts): acepta dos proyectos de prueba (scripts/fixtures) y
 *    un caso de ejemplo bien formado, y detecta cada regla rota.
 * 2. El conversor de texto a bloques y el del editor (lib/proyectos-editor.ts), de ida y vuelta y
 *    sin pérdidas con los proyectos de prueba y con los reales.
 * 3. Los proyectos reales: los publicados en Supabase (portfolio_projects) pasan el comprobador sin
 *    errores y su contenido hace la ida y vuelta del conversor y del editor sin pérdidas. Lee con la
 *    clave anon, como la web, así que solo ve los publicados. Necesita NEXT_PUBLIC_SUPABASE_URL y
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY (de .env.local); sin ellas se omite, para que `npm test` siga
 *    funcionando sin red. Con PORTFOLIO_EXPORT=<json de /api/admin/portfolio/exportar> prueba en su
 *    lugar los proyectos de esa copia de seguridad (los publicados, igual que la web):
 *
 *   PORTFOLIO_EXPORT=C:/ruta/portfolio-2026-11-14.json npx tsx scripts/probar-proyectos.ts
 *
 *   npx tsx scripts/probar-proyectos.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { bloquesATexto, imagenesConocidas, textoABloques } from "../lib/blog-markup";
import {
  contenidoAEditor,
  editorAContenido,
  esEditorProyecto,
  type EditorProyecto,
} from "../lib/proyectos-editor";
import type { ProyectoContent, ProyectoLocale } from "../lib/proyectos-types";
import {
  EJEMPLO,
  parsearPalabrasProhibidas,
  contarFrases,
  validarProyecto,
  type ProyectoParaValidar,
} from "../lib/proyectos-validate";
import { PROYECTOS_PRUEBA, type ProyectoPrueba } from "./fixtures/proyectos-prueba";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Sin archivo: se usan las variables del entorno.
}

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

/** El contenido de un proyecto de prueba en un idioma. */
function localeDe(p: ProyectoPrueba, lang: "es" | "en"): ProyectoLocale {
  return clonar(p[lang]);
}

function paraValidar(p: ProyectoPrueba): ProyectoParaValidar {
  return {
    slug: p.slug,
    service: p.service,
    date: p.date,
    tech: p.tech,
    enServicios: [],
    image: p.image ?? null,
    imageDark: p.imageDark ?? null,
    ogImage: p.ogImage ?? null,
    ejemplo: false,
    datosProvisionales: p.datosProvisionales,
    es: localeDe(p, "es"),
    en: localeDe(p, "en"),
  };
}

/** Un proyecto de ejemplo bien formado, sin imágenes, que cada prueba rompe a su manera. */
function ejemploBase(): ProyectoParaValidar {
  const lang = (l: "es" | "en"): ProyectoLocale => ({
    title: l === "es" ? "Red de un despacho" : "A small office network",
    tag: l === "es" ? "Infraestructura" : "Infrastructure",
    desc: `${EJEMPLO[l].descInicio} ${l === "es" ? "Segmentación de red para un despacho pequeño." : "Network segmentation for a small office."}`,
    post: {
      title: l === "es" ? "Segmentar la red de un despacho" : "Segmenting a small office network",
      intro: l === "es" ? "Una red sencilla y segura." : "A simple, secure network.",
      sections: [
        { blocks: [EJEMPLO[l].parrafo] },
        {
          heading: l === "es" ? "El planteamiento" : "The approach",
          blocks: [l === "es" ? "Tres redes separadas." : "Three separate networks."],
        },
      ],
    },
    facts: [
      { label: l === "es" ? "Tipo" : "Type", value: EJEMPLO[l].fact },
      { label: l === "es" ? "Alcance" : "Scope", value: l === "es" ? "Una oficina" : "One office" },
      { label: l === "es" ? "Estado" : "Status", value: l === "es" ? "Terminado" : "Finished" },
    ],
  });
  return {
    slug: "red-despacho-ejemplo",
    service: "sistemas",
    date: "2026-11-13",
    tech: ["Omada", "VLAN", "Firewall"],
    enServicios: [],
    image: null,
    imageDark: null,
    ogImage: null,
    ejemplo: true,
    datosProvisionales: false,
    es: lang("es"),
    en: lang("en"),
  };
}

const errores = (p: ProyectoParaValidar, publicar = true) =>
  validarProyecto(p, { publicar }).errores;
const hay = (p: ProyectoParaValidar, ruta: string, publicar = true) =>
  errores(p, publicar).some(
    (e) => e.ruta === ruta || e.ruta.startsWith(`${ruta}.`) || e.ruta.startsWith(`${ruta}[`),
  );
const detalle = (p: ProyectoParaValidar) =>
  errores(p)
    .map((e) => `${e.ruta}: ${e.mensaje}`)
    .join(" | ");

console.log("Comprobador, lo que tiene que aceptar");
for (const p of PROYECTOS_PRUEBA) {
  const r = paraValidar(p);
  comprobar(`${p.slug} no tiene errores`, errores(r).length === 0, detalle(r));
}
comprobar(
  "un caso de ejemplo bien formado no tiene errores",
  errores(ejemploBase()).length === 0,
  detalle(ejemploBase()),
);
comprobar(
  "un proyecto sin inglés solo avisa",
  (() => {
    const r = paraValidar(PROYECTOS_PRUEBA[0]);
    r.en = { title: "", tag: "", desc: "", post: { sections: [] }, facts: [] };
    const res = validarProyecto(r, { publicar: true });
    return res.errores.length === 0 && res.avisos.some((a) => a.ruta === "en");
  })(),
);
comprobar(
  "las cifras provisionales salen como aviso",
  validarProyecto(paraValidar(PROYECTOS_PRUEBA[0]), { publicar: true }).avisos.some(
    (a) => a.ruta === "datosProvisionales",
  ),
);

console.log("Comprobador, lo que tiene que detectar");
{
  const rayaLarga = String.fromCharCode(0x2014);
  const a = ejemploBase();
  a.es.post.intro = `Una red ${rayaLarga} sencilla.`;
  comprobar("raya larga en la entradilla", hay(a, "es.post.intro"));

  const b = ejemploBase();
  b.en.facts[1].value = `One ${rayaLarga} office`;
  comprobar("raya larga en la ficha rápida (inglés)", hay(b, "en.facts[1].value"));

  const c = ejemploBase();
  c.es.post.sections[1].heading = "El planteamiento: tres redes";
  comprobar("dos puntos en un H2", hay(c, "es.post.sections[1].heading"));

  const d = ejemploBase();
  d.es.title = "Red: despacho";
  comprobar("dos puntos en el título de la card", hay(d, "es.title"));

  const e = ejemploBase();
  e.slug = "Red-Despacho";
  comprobar("slug con mayúsculas", hay(e, "slug"));
  comprobar("slug con mayúsculas bloquea también un borrador", hay(e, "slug", false));

  const f = ejemploBase();
  f.es.facts = f.es.facts.slice(0, 2);
  comprobar("facts con 2 datos", hay(f, "es.facts"));

  const g = ejemploBase();
  g.en.post.intro = "";
  comprobar("inglés a medias, sin entradilla", hay(g, "en.post.intro"));

  const h = ejemploBase();
  h.en.post.sections = h.en.post.sections.slice(0, 1);
  comprobar("inglés a medias, con menos secciones", hay(h, "en.post.sections"));

  const i = ejemploBase();
  i.es.caseStudy = { quote: { text: "Muy bien.", author: "Cliente", permiso: true } };
  comprobar("un ejemplo con quote", hay(i, "es.caseStudy.quote"));

  const j = ejemploBase();
  j.es.caseStudy = { results: [{ label: "Tiempo", before: "10", after: "2" }] };
  comprobar("un ejemplo con results", hay(j, "es.caseStudy.results"));

  const k = ejemploBase();
  k.es.desc = "Segmentación de red para un despacho pequeño.";
  comprobar("un ejemplo sin 'Caso de ejemplo.' en la descripción", hay(k, "es.desc"));

  const l = ejemploBase();
  l.en.facts[0].value = "Client project";
  comprobar("un ejemplo sin la marca en el primer dato (inglés)", hay(l, "en.facts[0]"));

  const m = ejemploBase();
  m.es.post.sections[0].blocks = ["Otro párrafo."];
  comprobar("un ejemplo sin el aviso como primer párrafo", hay(m, "es.post.sections[0].blocks[0]"));

  const n = paraValidar(PROYECTOS_PRUEBA[1]);
  n.es.caseStudy = { quote: { text: "Muy bien.", author: "Cliente" } };
  comprobar("cita sin permiso del cliente", hay(n, "es.caseStudy.quote"));
  n.es.caseStudy = { quote: { text: "Muy bien.", author: "Cliente", permiso: true } };
  n.datosProvisionales = true;
  comprobar("cita con cifras provisionales", hay(n, "es.caseStudy.quote"));
  n.datosProvisionales = false;
  comprobar("cita con permiso y cifras validadas", !hay(n, "es.caseStudy.quote"));

  const o = ejemploBase();
  o.es.caseStudy = { results: [{ label: "Tiempo", before: "", after: "2" }] };
  o.ejemplo = false;
  comprobar("cifra sin 'antes'", hay(o, "es.caseStudy.results[0]"));

  const q = ejemploBase();
  q.es.post.sections[1].heading = "1. El planteamiento";
  comprobar("H2 con número", hay(q, "es.post.sections[1].heading"));
  const q2 = ejemploBase();
  q2.es.post.sections[1].heading = "2026 en cifras";
  comprobar(
    "H2 que empieza por un año no cuenta como número",
    !hay(q2, "es.post.sections[1].heading"),
  );

  const r = ejemploBase();
  r.es.desc = `${EJEMPLO.es.descInicio} Una frase. Otra frase.`;
  comprobar("descripción de 3 frases", hay(r, "es.desc"));
  comprobar(
    "Next.js y 3.5 no cuentan como fin de frase",
    contarFrases("Hecho con Next.js 3.5 y Supabase.") === 1,
  );

  const s = ejemploBase();
  s.es.tag = "Infraestructura de red local";
  comprobar("etiqueta de 4 palabras", hay(s, "es.tag"));
  const s2 = ejemploBase();
  s2.es.tag = "Redes";
  comprobar(
    "etiqueta nueva solo avisa",
    errores(s2).length === 0 &&
      validarProyecto(s2, { publicar: true }).avisos.some((a) => a.ruta === "es.tag"),
  );

  const t = ejemploBase();
  t.tech = ["A", "B"];
  comprobar("2 tecnologías", hay(t, "tech"));

  const u = ejemploBase();
  u.service = "otro";
  comprobar("servicio no válido", hay(u, "service"));

  const v = ejemploBase();
  v.date = "2026-02-30";
  comprobar("fecha que no existe", hay(v, "date"));

  const w = ejemploBase();
  w.image = "/projects/portada.svg";
  comprobar("portada con imagen y sin coverAlt", hay(w, "es.coverAlt"));
  w.es.coverAlt = "Un esquema de red.";
  w.en.coverAlt = "A network diagram.";
  comprobar(
    "portada con coverAlt en los dos idiomas",
    !hay(w, "es.coverAlt") && !hay(w, "en.coverAlt"),
  );
  w.image = "https://otro.sitio/portada.png";
  comprobar("portada fuera de /projects y /portfolio-img", hay(w, "image"));

  const x = ejemploBase();
  x.es.post.sections[1].blocks.push({
    img: "/portfolio-img/x/a.webp",
    alt: "",
    width: 0,
    height: 0,
  });
  x.en.post.sections[1].blocks.push({
    img: "/portfolio-img/x/a.webp",
    alt: "A",
    width: 10,
    height: 10,
  });
  comprobar(
    "imagen del artículo sin alt ni tamaño",
    hay(x, "es.post.sections[1].blocks[1].alt") && hay(x, "es.post.sections[1].blocks[1].width"),
  );

  // Palabras prohibidas: salen de la variable de entorno PALABRAS_PROHIBIDAS (aquí, una de prueba).
  const anterior = process.env.PALABRAS_PROHIBIDAS;
  const y = ejemploBase();
  y.es.post.intro = "Trabajo hecho para la cadena Hotelera Sol.";
  y.en.post.intro = "Work done for the Hotelera Sol chain.";
  delete process.env.PALABRAS_PROHIBIDAS;
  comprobar("sin variable, no valida nada", !hay(y, "es.post.intro"));
  process.env.PALABRAS_PROHIBIDAS = "";
  comprobar("variable vacía, no valida nada", !hay(y, "es.post.intro"));
  process.env.PALABRAS_PROHIBIDAS = " , ,";
  comprobar("variable solo con comas y espacios, no valida nada", !hay(y, "es.post.intro"));
  process.env.PALABRAS_PROHIBIDAS = "Cliente Falso SL, hotelera sol ,,Otra";
  comprobar("palabra de la variable en español", hay(y, "es.post.intro"));
  comprobar("palabra de la variable en inglés, sin distinguir mayúsculas", hay(y, "en.post.intro"));
  comprobar(
    "el mensaje señala la palabra",
    errores(y).some((e) => e.ruta === "es.post.intro" && e.mensaje.includes("hotelera sol")),
  );
  const limpio2 = ejemploBase();
  comprobar("un proyecto sin esas palabras sigue sin errores", errores(limpio2).length === 0);
  comprobar("con una palabra prohibida, un borrador no bloquea (solo avisa)", !hay(y, "es.post.intro", false));
  comprobar(
    "las palabras pueden llegar por opciones (el navegador)",
    validarProyecto(y, { publicar: true, prohibidas: ["Sol"] }).errores.some((e) => e.ruta === "es.post.intro"),
  );
  comprobar(
    "las opciones mandan sobre la variable",
    !validarProyecto(y, { publicar: true, prohibidas: ["nada"] }).errores.some((e) => e.ruta === "es.post.intro"),
  );
  comprobar(
    "parsearPalabrasProhibidas recorta, quita vacías y repite",
    parsearPalabrasProhibidas("  Uno ,uno,, Dos Palabras ,").join("|") === "Uno|Dos Palabras",
  );
  if (anterior === undefined) delete process.env.PALABRAS_PROHIBIDAS;
  else process.env.PALABRAS_PROHIBIDAS = anterior;

  const z = ejemploBase();
  z.es.title = "";
  comprobar("sin título en español bloquea un borrador", hay(z, "es.title", false));
  const z2 = ejemploBase();
  z2.es.post.intro = "";
  comprobar(
    "sin entradilla solo bloquea al publicar",
    !hay(z2, "es.post.intro", false) && hay(z2, "es.post.intro", true),
  );

  const av = ejemploBase();
  av.es.facts[1].value = "De 24-48 horas";
  av.es.facts[2].value = "Resultado: ok";
  const avisos = validarProyecto(av, { publicar: true }).avisos;
  comprobar(
    "aviso de rango con guion",
    avisos.some((a) => a.ruta === "es.facts[1].value"),
  );
  comprobar(
    "aviso de dos puntos en la ficha",
    avisos.some((a) => a.ruta === "es.facts[2].value"),
  );
  comprobar(
    "aviso de proyecto sin imagen social",
    avisos.some((a) => a.ruta === "ogImage"),
  );
}

/** Ida y vuelta del conversor de texto a bloques con el contenido de un idioma. */
function probarConversor(nombre: string, contenido: ProyectoLocale, idioma: string) {
  const secciones = contenido.post.sections;
  const texto = bloquesATexto(secciones);
  const vuelta = textoABloques(texto, imagenesConocidas(secciones));
  comprobar(`${nombre} (${idioma}) bloques a texto y de vuelta`, canonico(vuelta) === canonico(secciones));
  comprobar(`${nombre} (${idioma}) texto a bloques y de vuelta`, bloquesATexto(vuelta) === texto);
}

/** Ida y vuelta del editor con el contenido de un idioma. */
function probarEditor(nombre: string, contenido: ProyectoLocale, idioma: string) {
  const campos = contenidoAEditor(contenido);
  const vuelta = editorAContenido(campos, imagenesConocidas(contenido.post.sections));
  comprobar(`${nombre} (${idioma}) contenido a editor y de vuelta`, canonico(vuelta) === canonico(contenido));
}

console.log("Conversor texto y bloques, ida y vuelta");
for (const p of PROYECTOS_PRUEBA) {
  for (const idioma of ["es", "en"] as const) probarConversor(p.slug, p[idioma], idioma);
}

console.log("Editor, ida y vuelta");
for (const p of PROYECTOS_PRUEBA) {
  for (const idioma of ["es", "en"] as const) probarEditor(p.slug, p[idioma], idioma);
}
{
  const p = PROYECTOS_PRUEBA[0];
  const editor: EditorProyecto = {
    id: null,
    slug: p.slug,
    service: p.service,
    tech: p.tech,
    cover: p.cover,
    tint: p.tint,
    url: "",
    image: p.image ?? "",
    imageDark: "",
    coverPosition: "",
    ogImage: p.ogImage ?? "",
    enServicios: [],
    ejemplo: false,
    datosProvisionales: true,
    es: contenidoAEditor(localeDe(p, "es")),
    en: contenidoAEditor(localeDe(p, "en")),
  };
  comprobar("esEditorProyecto acepta un editor válido", esEditorProyecto(editor));
  comprobar(
    "esEditorProyecto rechaza un servicio que no es texto",
    !esEditorProyecto({ ...editor, service: 3 }),
  );
  comprobar(
    "esEditorProyecto rechaza un encuadre inventado",
    !esEditorProyecto({ ...editor, coverPosition: "abajo" }),
  );
  comprobar(
    "esEditorProyecto rechaza facts que no son filas",
    !esEditorProyecto({ ...editor, es: { ...editor.es, facts: [1] } }),
  );
  const vacioEn = {
    ...editor.en,
    facts: [
      { label: "", value: "" },
      { label: "", value: "" },
      { label: "", value: "" },
    ],
    body: "",
  };
  comprobar(
    "un inglés vacío del editor se guarda como inglés vacío",
    (() => {
      const c = editorAContenido({
        ...vacioEn,
        title: "",
        tag: "",
        desc: "",
        coverAlt: "",
        postTitle: "",
        seoTitle: "",
        intro: "",
        context: "",
        role: "",
        results: [],
        snippetTitle: "",
        snippetCode: "",
        quoteText: "",
        quoteAuthor: "",
        quotePermiso: false,
      });
      return c.facts.length === 0 && c.post.sections.length === 0 && c.caseStudy === undefined;
    })(),
  );
}

type FilaReal = {
  slug: string;
  status: string;
  service: ProyectoParaValidar["service"];
  tech: string[];
  image: string | null;
  image_dark: string | null;
  og_image: string | null;
  en_servicios: string[];
  ejemplo: boolean;
  datos_provisionales: boolean;
  published_at: string | null;
  content: ProyectoContent;
};

const COLUMNAS_REALES =
  "slug, status, service, tech, image, image_dark, og_image, en_servicios, ejemplo, datos_provisionales, published_at, content";

/** Proyectos reales: de una copia de seguridad (PORTFOLIO_EXPORT) o de Supabase con la clave anon. */
async function cargarReales(): Promise<{ filas: FilaReal[]; origen: string } | null> {
  const exportado = process.env.PORTFOLIO_EXPORT;
  if (exportado) {
    const json = JSON.parse(readFileSync(exportado, "utf8")) as { proyectos?: FilaReal[] };
    const publicadas = (json.proyectos ?? []).filter((f) => f.status === "publicado");
    return { filas: publicadas, origen: `copia de seguridad (${exportado})` };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) return null;
  const { data, error } = await createClient(url, clave, { auth: { persistSession: false } })
    .from("portfolio_projects")
    .select(COLUMNAS_REALES)
    .eq("status", "publicado")
    .order("orden", { ascending: true });
  if (error) throw new Error(error.message);
  return { filas: (data ?? []) as FilaReal[], origen: "Supabase (clave anon)" };
}

async function probarReales() {
  const reales = await cargarReales();
  if (!reales) {
    console.log("\nProyectos reales, omitido (faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY).");
    return;
  }
  console.log(`\nProyectos reales, ${reales.origen}`);
  comprobar("hay al menos un proyecto publicado", reales.filas.length > 0);
  for (const f of reales.filas) {
    const dia = f.published_at
      ? new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date(f.published_at))
      : undefined;
    const r = validarProyecto(
      {
        slug: f.slug,
        service: f.service,
        date: dia,
        tech: f.tech,
        enServicios: f.en_servicios,
        image: f.image,
        imageDark: f.image_dark,
        ogImage: f.og_image,
        ejemplo: f.ejemplo,
        datosProvisionales: f.datos_provisionales,
        es: f.content.es,
        en: f.content.en,
      },
      { publicar: true },
    );
    comprobar(
      `${f.slug} pasa el comprobador sin errores`,
      r.errores.length === 0,
      r.errores.map((e) => `${e.ruta}: ${e.mensaje}`).join(" | "),
    );
    for (const idioma of ["es", "en"] as const) {
      const c = f.content[idioma];
      if (c.post.sections.length === 0) continue; // sin inglés: no hay nada que convertir
      probarConversor(f.slug, c, idioma);
      probarEditor(f.slug, c, idioma);
    }
  }
}

probarReales()
  .catch((e) => {
    fallos++;
    console.error(e);
  })
  .finally(() => {
    console.log(`\n${pasadas} pruebas correctas, ${fallos} con fallo.`);
    process.exit(fallos === 0 ? 0 : 1);
  });
