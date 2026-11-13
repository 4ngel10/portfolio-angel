/**
 * Comprobador de los proyectos del portfolio. Lo usan las server actions (lib/proyectos-actions.ts)
 * y el panel. Sin dependencias de servidor, para poder ejecutarlo también en el navegador.
 *
 * Los mensajes van en español: son sobre el contenido y los lee quien edita. OJO con las expresiones
 * regulares: aquí no se usa ninguna con barras invertidas (en Windows se pierden). Todo se hace
 * recorriendo el texto o con `includes`.
 *
 * Las reglas salen de CLAUDE.md ("Convenciones de diseño" y "Páginas de proyecto").
 */

import type { Locale } from "./i18n";
import type {
  CaseStudy,
  PostBlock,
  PostImage,
  ProyectoLocale,
  ProyectoServicio,
} from "./proyectos-types";
import { slugValido } from "./blog-validate";

export type Fallo = { ruta: string; mensaje: string };
export type Resultado = { errores: Fallo[]; avisos: Fallo[] };

export type ProyectoParaValidar = {
  slug: string;
  service: string;
  /** AAAA-MM-DD de la publicación. Sin fecha (borrador sin publicar) no se comprueba. */
  date?: string;
  tech: string[];
  /** Servicios donde sale el proyecto (`en_servicios`). */
  enServicios: string[];
  image?: string | null;
  imageDark?: string | null;
  ogImage?: string | null;
  ejemplo: boolean;
  datosProvisionales: boolean;
  es: ProyectoLocale;
  en: ProyectoLocale;
};

export const SERVICIOS: readonly ProyectoServicio[] = ["web", "sistemas"];
export const IDIOMAS: readonly Locale[] = ["es", "en"];

/** Etiquetas ya en uso (CLAUDE.md): otra distinta es solo un aviso. */
export const ETIQUETAS_CONOCIDAS: Record<Locale, readonly string[]> = {
  es: ["Automatización", "Desarrollo web", "Infraestructura"],
  en: ["Automation", "Web development", "Infrastructure"],
};

/**
 * Palabras que no pueden aparecer en ningún texto (grupos hoteleros, empresas, clientes). Salen de la
 * variable de entorno PALABRAS_PROHIBIDAS, una lista separada por comas que se compara sin distinguir
 * mayúsculas, para que los nombres reales no acaben en el repositorio. Vacía o sin definir, no valida
 * nada. Solo la ve el servidor (no lleva NEXT_PUBLIC_): el editor del panel las recibe por props desde
 * una página de admin.
 */
export function parsearPalabrasProhibidas(valor: string | undefined): string[] {
  if (!valor) return [];
  const vistas = new Set<string>();
  const salida: string[] = [];
  for (const trozo of valor.split(",")) {
    const palabra = trozo.trim();
    const clave = palabra.toLowerCase();
    if (palabra === "" || vistas.has(clave)) continue;
    vistas.add(clave);
    salida.push(palabra);
  }
  return salida;
}

export function palabrasProhibidasDeEntorno(): string[] {
  return parsearPalabrasProhibidas(process.env.PALABRAS_PROHIBIDAS);
}

/** Textos fijos de un caso de ejemplo, en los dos idiomas. */
export const EJEMPLO = {
  es: {
    descInicio: "Caso de ejemplo.",
    fact: "Caso de ejemplo, no es un cliente real",
    parrafo:
      "Este caso es un ejemplo inventado para enseñar cómo trabajo. No es un cliente real y las cifras son orientativas.",
  },
  en: {
    descInicio: "Example case.",
    fact: "Example case, not a real client",
    parrafo:
      "This case is made up to show how I work. It is not a real client and the figures are indicative.",
  },
} as const;

const RAYA_LARGA = String.fromCharCode(0x2014);
const DOS_PUNTOS = String.fromCharCode(0x3a);
const MAX_DESC_FRASES = 2;
const MAX_ETIQUETA_PALABRAS = 2;

/** Cuenta palabras recorriendo el texto. Separadores, solo espacio, tabulador y saltos de línea. */
export function contarPalabras(texto: string): number {
  let palabras = 0;
  let dentro = false;
  for (let i = 0; i < texto.length; i++) {
    const codigo = texto.charCodeAt(i);
    const separador = codigo === 32 || codigo === 9 || codigo === 10 || codigo === 13;
    if (separador) dentro = false;
    else if (!dentro) {
      dentro = true;
      palabras++;
    }
  }
  return palabras;
}

/**
 * Frases de un texto: un punto, una exclamación o una interrogación cierran frase si van seguidos
 * de un espacio o del final ("Next.js" o "3.5" no cuentan). Un texto sin punto final es una frase.
 */
export function contarFrases(texto: string): number {
  const t = texto.trim();
  if (t === "") return 0;
  let frases = 0;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (c !== "." && c !== "!" && c !== "?") continue;
    if (t[i + 1] === c) continue; // los puntos suspensivos cuentan una vez
    if (i === t.length - 1 || t[i + 1] === " ") frases++;
  }
  return Math.max(frases, 1);
}

function esImagen(b: PostBlock): b is PostImage {
  return typeof b === "object" && b !== null && "img" in b;
}

/** Quita el destino de los enlaces, `[texto](/ruta)` queda como `[texto]`. */
function sinDestinos(texto: string): string {
  let salida = "";
  let i = 0;
  while (i < texto.length) {
    if (texto[i] === "]" && texto[i + 1] === "(") {
      const fin = texto.indexOf(")", i + 2);
      if (fin >= 0) {
        salida += "]";
        i = fin + 1;
        continue;
      }
    }
    salida += texto[i];
    i++;
  }
  return salida;
}

/** Dos puntos de puntuación, seguidos de espacio o al final. Los de "https://" no cuentan. */
function tieneDosPuntos(texto: string): boolean {
  const limpio = sinDestinos(texto);
  for (let i = 0; i < limpio.length; i++) {
    if (limpio[i] === DOS_PUNTOS && (i === limpio.length - 1 || limpio[i + 1] === " ")) return true;
  }
  return false;
}

/** Un guion suelto como puntuación (" - "), no el de una palabra compuesta. */
function tieneGuionDePuntuacion(texto: string): boolean {
  return sinDestinos(texto).includes(" - ");
}

/** Hay un guion entre dos números cortos, como "24-48" (las fechas AAAA-MM-DD no cuentan). */
function tieneRangoConGuion(texto: string): boolean {
  const limpio = sinDestinos(texto);
  const esNumero = (c: string | undefined) => c !== undefined && c >= "0" && c <= "9";
  for (let i = 1; i < limpio.length - 1; i++) {
    if (limpio[i] !== "-" || !esNumero(limpio[i - 1]) || !esNumero(limpio[i + 1])) continue;
    let antes = 0;
    while (esNumero(limpio[i - 1 - antes])) antes++;
    let despues = 0;
    while (esNumero(limpio[i + 1 + despues])) despues++;
    if (antes <= 3 && despues <= 3) return true;
  }
  return false;
}

/** El H2 empieza por un número de orden como "1." o "02)". "2026 en cifras" no cuenta. */
function empiezaConNumeracion(texto: string): boolean {
  let i = 0;
  while (i < texto.length && texto[i] >= "0" && texto[i] <= "9") i++;
  return i > 0 && i <= 2 && (texto[i] === "." || texto[i] === ")" || texto[i] === "-");
}

/** AAAA-MM-DD de un día que existe. */
export function fechaValida(fecha: string): boolean {
  if (fecha.length !== 10 || fecha[4] !== "-" || fecha[7] !== "-") return false;
  const [a, m, d] = fecha.split("-").map(Number);
  if (![a, m, d].every((n) => Number.isInteger(n))) return false;
  const prueba = new Date(Date.UTC(a, m - 1, d));
  return (
    prueba.getUTCFullYear() === a && prueba.getUTCMonth() === m - 1 && prueba.getUTCDate() === d
  );
}

type Texto = { ruta: string; texto: string };

/** Todo el texto visible de un idioma, con la ruta de cada trozo. */
function textosDe(prefijo: string, c: ProyectoLocale): Texto[] {
  const salida: Texto[] = [
    { ruta: `${prefijo}.title`, texto: c.title ?? "" },
    { ruta: `${prefijo}.tag`, texto: c.tag ?? "" },
    { ruta: `${prefijo}.desc`, texto: c.desc ?? "" },
    { ruta: `${prefijo}.coverAlt`, texto: c.coverAlt ?? "" },
    { ruta: `${prefijo}.post.title`, texto: c.post?.title ?? "" },
    { ruta: `${prefijo}.post.seoTitle`, texto: c.post?.seoTitle ?? "" },
    { ruta: `${prefijo}.post.intro`, texto: c.post?.intro ?? "" },
  ];
  (c.facts ?? []).forEach((f, i) => {
    salida.push({ ruta: `${prefijo}.facts[${i}].label`, texto: f.label ?? "" });
    salida.push({ ruta: `${prefijo}.facts[${i}].value`, texto: f.value ?? "" });
  });
  (c.post?.sections ?? []).forEach((s, i) => {
    salida.push({ ruta: `${prefijo}.post.sections[${i}].heading`, texto: s.heading ?? "" });
    s.blocks.forEach((b, j) => {
      const ruta = `${prefijo}.post.sections[${i}].blocks[${j}]`;
      if (typeof b === "string") salida.push({ ruta, texto: b });
      else if ("h3" in b) salida.push({ ruta, texto: b.h3 });
      else if ("list" in b)
        b.list.forEach((x, k) => salida.push({ ruta: `${ruta}.list[${k}]`, texto: x }));
      else if ("ol" in b)
        b.ol.forEach((x, k) => salida.push({ ruta: `${ruta}.ol[${k}]`, texto: x }));
      else if (esImagen(b)) {
        salida.push({ ruta: `${ruta}.alt`, texto: b.alt ?? "" });
        salida.push({ ruta: `${ruta}.caption`, texto: b.caption ?? "" });
      }
    });
  });
  const cs: CaseStudy | undefined = c.caseStudy;
  if (cs) {
    const p = `${prefijo}.caseStudy`;
    salida.push({ ruta: `${p}.context`, texto: cs.context ?? "" });
    salida.push({ ruta: `${p}.role`, texto: cs.role ?? "" });
    (cs.results ?? []).forEach((r, i) => {
      salida.push({ ruta: `${p}.results[${i}].label`, texto: r.label ?? "" });
      salida.push({ ruta: `${p}.results[${i}].before`, texto: r.before ?? "" });
      salida.push({ ruta: `${p}.results[${i}].after`, texto: r.after ?? "" });
    });
    salida.push({ ruta: `${p}.snippet.title`, texto: cs.snippet?.title ?? "" });
    salida.push({ ruta: `${p}.quote.text`, texto: cs.quote?.text ?? "" });
    salida.push({ ruta: `${p}.quote.author`, texto: cs.quote?.author ?? "" });
  }
  return salida;
}

function imagenesDe(c: ProyectoLocale): { img: PostImage; ruta: string }[] {
  const salida: { img: PostImage; ruta: string }[] = [];
  (c.post?.sections ?? []).forEach((s, i) =>
    s.blocks.forEach((b, j) => {
      if (esImagen(b)) salida.push({ img: b, ruta: `post.sections[${i}].blocks[${j}]` });
    }),
  );
  return salida;
}

function vacio(t: string | undefined | null): boolean {
  return (t ?? "").trim() === "";
}

/** ¿Hay algo escrito en este idioma? Sirve para el "todo o nada" del inglés. */
export function tieneContenido(c: ProyectoLocale): boolean {
  return (
    !vacio(c.title) ||
    !vacio(c.tag) ||
    !vacio(c.desc) ||
    !vacio(c.coverAlt) ||
    !vacio(c.post?.title) ||
    !vacio(c.post?.seoTitle) ||
    !vacio(c.post?.intro) ||
    (c.post?.sections ?? []).length > 0 ||
    (c.facts ?? []).length > 0 ||
    c.caseStudy !== undefined
  );
}

function rutaDeImagenValida(src: string): boolean {
  return (src.startsWith("/projects/") || src.startsWith("/portfolio-img/")) && !src.includes("..");
}

/**
 * Valida un proyecto. Con `publicar: true` salen todos los errores (lo que impide publicar). Con
 * `publicar: false` (guardar un borrador) solo bloquean los que impiden guardarlo, el slug, el
 * servicio y el título en español, y el resto sale como avisos.
 */
export function validarProyecto(
  p: ProyectoParaValidar,
  opciones: { publicar: boolean; prohibidas?: readonly string[] },
): Resultado {
  const errores: Fallo[] = [];
  const avisos: Fallo[] = [];
  const bloquea = (f: Fallo, siempre = false) =>
    (opciones.publicar || siempre ? errores : avisos).push(f);
  // En el navegador la variable no existe y la lista llega por opciones (desde el servidor).
  const prohibidas = opciones.prohibidas ?? palabrasProhibidasDeEntorno();

  // Campos comunes.
  if (!slugValido(p.slug)) {
    bloquea(
      {
        ruta: "slug",
        mensaje:
          "El slug solo admite minúsculas, números y guiones sueltos, por ejemplo mi-proyecto.",
      },
      true,
    );
  }
  if (!(SERVICIOS as readonly string[]).includes(p.service)) {
    bloquea({ ruta: "service", mensaje: 'El servicio tiene que ser "web" o "sistemas".' }, true);
  }
  if (vacio(p.es.title)) {
    bloquea({ ruta: "es.title", mensaje: "Falta el título de la card en español." }, true);
  }
  if (p.date !== undefined && !fechaValida(p.date)) {
    bloquea({ ruta: "date", mensaje: "La fecha no es válida (AAAA-MM-DD)." });
  }
  if (p.tech.length < 3 || p.tech.length > 4 || p.tech.some((t) => vacio(t))) {
    bloquea({
      ruta: "tech",
      mensaje: `Hacen falta 3 o 4 tecnologías y hay ${p.tech.filter((t) => !vacio(t)).length}.`,
    });
  }
  for (const s of p.enServicios) {
    if (!(SERVICIOS as readonly string[]).includes(s)) {
      bloquea({ ruta: "enServicios", mensaje: `"${s}" no es un servicio válido.` });
    }
  }
  for (const [ruta, src] of [
    ["image", p.image],
    ["imageDark", p.imageDark],
    ["ogImage", p.ogImage],
  ] as const) {
    if (src && !rutaDeImagenValida(src)) {
      bloquea({ ruta, mensaje: "La imagen debe apuntar a /projects/ o a /portfolio-img/." });
    }
  }

  const hayInglesEscrito = tieneContenido(p.en);
  const idiomas: readonly Locale[] = hayInglesEscrito ? IDIOMAS : ["es"];
  const hayPortada = Boolean(p.image || p.imageDark);

  for (const idioma of idiomas) {
    const c = p[idioma];
    const nombre = idioma === "es" ? "español" : "inglés";

    // Obligatorios del idioma (el título en español ya salió arriba).
    const obligatorios: [string, string | undefined, string][] = [
      ["title", c.title, "el título de la card"],
      ["tag", c.tag, "la etiqueta"],
      ["desc", c.desc, "la descripción de la card"],
      ["post.title", c.post?.title, "el título largo del artículo"],
      ["post.intro", c.post?.intro, "la entradilla"],
    ];
    for (const [campo, valor, cual] of obligatorios) {
      if (vacio(valor) && !(idioma === "es" && campo === "title")) {
        bloquea({ ruta: `${idioma}.${campo}`, mensaje: `Falta ${cual} en ${nombre}.` });
      }
    }
    if ((c.post?.sections ?? []).length === 0) {
      bloquea({
        ruta: `${idioma}.post.sections`,
        mensaje: `Falta el cuerpo del artículo en ${nombre}.`,
      });
    }

    // Etiqueta de una o dos palabras.
    const palabrasTag = contarPalabras(c.tag ?? "");
    if (palabrasTag > MAX_ETIQUETA_PALABRAS) {
      bloquea({
        ruta: `${idioma}.tag`,
        mensaje: `La etiqueta tiene ${palabrasTag} palabras y debe tener una o dos.`,
      });
    } else if (palabrasTag > 0 && !ETIQUETAS_CONOCIDAS[idioma].includes((c.tag ?? "").trim())) {
      avisos.push({
        ruta: `${idioma}.tag`,
        mensaje: `La etiqueta no es una de las habituales (${ETIQUETAS_CONOCIDAS[idioma].join(", ")}). Reutiliza una si encaja.`,
      });
    }

    // Descripción de una o dos frases.
    const frases = contarFrases(c.desc ?? "");
    if (frases > MAX_DESC_FRASES) {
      bloquea({
        ruta: `${idioma}.desc`,
        mensaje: `La descripción tiene ${frases} frases y debe tener una o dos.`,
      });
    }

    // Raya larga en cualquier texto visible.
    for (const t of textosDe(idioma, c)) {
      if (t.texto.includes(RAYA_LARGA)) {
        bloquea({ ruta: t.ruta, mensaje: "Lleva una raya larga. Usa comas o puntos." });
      }
    }

    // Palabras prohibidas (nombres de clientes o empresas).
    for (const t of textosDe(idioma, c)) {
      const bajo = t.texto.toLowerCase();
      const encontrada = prohibidas.find(
        (w) => w !== "" && bajo.includes(w.toLowerCase()),
      );
      if (encontrada) {
        bloquea({ ruta: t.ruta, mensaje: `Aparece "${encontrada}", que no se puede nombrar.` });
      }
    }

    // Dos puntos en los títulos y en los H2; los H2 tampoco llevan número.
    if (tieneDosPuntos(c.title ?? "")) {
      bloquea({ ruta: `${idioma}.title`, mensaje: "El título no lleva dos puntos, usa una coma." });
    }
    if (tieneDosPuntos(c.post?.title ?? "")) {
      bloquea({
        ruta: `${idioma}.post.title`,
        mensaje: "El título largo no lleva dos puntos, usa una coma.",
      });
    }
    (c.post?.sections ?? []).forEach((s, i) => {
      const ruta = `${idioma}.post.sections[${i}].heading`;
      if (s.heading && tieneDosPuntos(s.heading)) {
        bloquea({ ruta, mensaje: "Un H2 no lleva dos puntos, usa una coma." });
      }
      if (s.heading && empiezaConNumeracion(s.heading)) {
        bloquea({ ruta, mensaje: "Un H2 no lleva número ni letra delante." });
      }
    });

    // Ficha rápida: exactamente 3 datos.
    const facts = c.facts ?? [];
    if (facts.length !== 3) {
      bloquea({
        ruta: `${idioma}.facts`,
        mensaje: `La ficha rápida necesita exactamente 3 datos y hay ${facts.length}.`,
      });
    }
    facts.forEach((f, i) => {
      if (vacio(f.label) || vacio(f.value)) {
        bloquea({
          ruta: `${idioma}.facts[${i}]`,
          mensaje: "El dato de la ficha tiene campos vacíos.",
        });
      }
    });

    // Portada: con imagen, texto alternativo.
    if (hayPortada && vacio(c.coverAlt)) {
      bloquea({
        ruta: `${idioma}.coverAlt`,
        mensaje: `La portada tiene imagen y falta su texto alternativo en ${nombre}.`,
      });
    }

    // Imágenes del artículo: alt, tamaño y ruta propia.
    for (const { img, ruta } of imagenesDe(c)) {
      const r = `${idioma}.${ruta}`;
      if (vacio(img.alt)) bloquea({ ruta: `${r}.alt`, mensaje: "La imagen no tiene alt." });
      if (!rutaDeImagenValida(img.img ?? "")) {
        bloquea({
          ruta: `${r}.img`,
          mensaje: "La imagen debe apuntar a /projects/ o a /portfolio-img/.",
        });
      }
      if (!(img.width > 0) || !(img.height > 0)) {
        bloquea({ ruta: `${r}.width`, mensaje: "La imagen no tiene width y height." });
      }
    }

    // Resumen del caso.
    const cs = c.caseStudy;
    if (cs) {
      (cs.results ?? []).forEach((r, i) => {
        if (vacio(r.label) || vacio(r.before) || vacio(r.after)) {
          bloquea({
            ruta: `${idioma}.caseStudy.results[${i}]`,
            mensaje: "Cada cifra necesita nombre, antes y después.",
          });
        }
      });
      if (cs.quote) {
        if (p.datosProvisionales) {
          bloquea({
            ruta: `${idioma}.caseStudy.quote`,
            mensaje: "Una cita exige que las cifras no estén marcadas como provisionales.",
          });
        }
        if (cs.quote.permiso !== true) {
          bloquea({
            ruta: `${idioma}.caseStudy.quote`,
            mensaje: "Marca que la cita tiene permiso del cliente.",
          });
        }
      }
    }

    // Caso de ejemplo: marcas fijas y nada que parezca real.
    if (p.ejemplo) {
      const e = EJEMPLO[idioma];
      if (!(c.desc ?? "").trim().startsWith(e.descInicio)) {
        bloquea({
          ruta: `${idioma}.desc`,
          mensaje: `En un caso de ejemplo la descripción empieza por "${e.descInicio}".`,
        });
      }
      if ((facts[0]?.value ?? "").trim() !== e.fact) {
        bloquea({
          ruta: `${idioma}.facts[0]`,
          mensaje: `En un caso de ejemplo el primer dato de la ficha es "${e.fact}".`,
        });
      }
      const primero = c.post?.sections?.[0]?.blocks?.[0];
      if (typeof primero !== "string" || primero.trim() !== e.parrafo) {
        bloquea({
          ruta: `${idioma}.post.sections[0].blocks[0]`,
          mensaje:
            "En un caso de ejemplo el primer párrafo tras la entradilla es el aviso de caso inventado.",
        });
      }
      if (cs?.quote) {
        bloquea({
          ruta: `${idioma}.caseStudy.quote`,
          mensaje: "Un caso de ejemplo no puede llevar cita.",
        });
      }
      if ((cs?.results ?? []).length > 0) {
        bloquea({
          ruta: `${idioma}.caseStudy.results`,
          mensaje: "Un caso de ejemplo no puede llevar cifras antes y después.",
        });
      }
    }

    // Avisos de estilo (la home es sensible a esto).
    for (const t of textosDe(idioma, c)) {
      if (t.texto && tieneRangoConGuion(t.texto)) {
        avisos.push({ ruta: t.ruta, mensaje: 'Rango con guion, mejor "24 a 48" que "24-48".' });
      }
    }
    const sensibles: Texto[] = [
      { ruta: `${idioma}.desc`, texto: c.desc ?? "" },
      ...facts.flatMap((f, i) => [
        { ruta: `${idioma}.facts[${i}].label`, texto: f.label ?? "" },
        { ruta: `${idioma}.facts[${i}].value`, texto: f.value ?? "" },
      ]),
    ];
    for (const t of sensibles) {
      if (tieneDosPuntos(t.texto)) {
        avisos.push({
          ruta: t.ruta,
          mensaje: "Lleva dos puntos. En la home, mejor una coma o un punto.",
        });
      }
    }
    for (const t of [{ ruta: `${idioma}.title`, texto: c.title ?? "" }, ...sensibles]) {
      if (tieneGuionDePuntuacion(t.texto)) {
        avisos.push({
          ruta: t.ruta,
          mensaje: "Lleva un guion como puntuación. Usa una coma o un punto.",
        });
      }
    }
  }

  // Inglés: todo o nada. Si hay algo, tiene que ser paralelo al español.
  if (hayInglesEscrito) {
    const seccionesEs = (p.es.post?.sections ?? []).length;
    const seccionesEn = (p.en.post?.sections ?? []).length;
    if (seccionesEs !== seccionesEn) {
      bloquea({
        ruta: "en.post.sections",
        mensaje: `Español e inglés tienen distinto número de secciones (${seccionesEs} y ${seccionesEn}).`,
      });
    }
    if (imagenesDe(p.es).length !== imagenesDe(p.en).length) {
      bloquea({
        ruta: "en.post.sections",
        mensaje: `Español e inglés tienen distinto número de imágenes (${imagenesDe(p.es).length} y ${imagenesDe(p.en).length}).`,
      });
    }
  } else {
    avisos.push({
      ruta: "en",
      mensaje:
        "No hay versión en inglés: /en/proyectos/<slug> dará 404 y no saldrá en la home en inglés.",
    });
  }

  if (p.datosProvisionales) {
    avisos.push({
      ruta: "datosProvisionales",
      mensaje: "Cifras sin validar, no las publiques como reales.",
    });
  }
  if (!p.ogImage) {
    avisos.push({ ruta: "ogImage", mensaje: "No hay imagen para redes (1200x630)." });
  }
  if (!p.es.caseStudy && !p.en.caseStudy) {
    avisos.push({ ruta: "caseStudy", mensaje: "No hay resumen del caso." });
  }

  return { errores, avisos };
}
