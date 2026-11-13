"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  borrarProyecto,
  despublicarProyecto,
  duplicarProyecto,
  guardarProyecto,
  marcarCifrasValidadas,
  publicarProyecto,
  restaurarVersion,
} from "@/lib/proyectos-actions";
import {
  contenidoDeEditor,
  type CamposProyectoIdioma,
  type EditorProyecto,
} from "@/lib/proyectos-editor";
import {
  EJEMPLO,
  ETIQUETAS_CONOCIDAS,
  SERVICIOS,
  contarPalabras,
  validarProyecto,
  type Fallo,
} from "@/lib/proyectos-validate";
import { slugValido } from "@/lib/blog-validate";
import { madridLocalAUtc } from "@/lib/blog-types";
import type { EstadoProyecto } from "@/lib/proyectos-admin";
import type { Locale } from "@/lib/i18n";
import type { TamanoImagen } from "@/lib/blog-markup";
import { inputCls, labelCls } from "./styles";
import { usePT } from "./i18n-provider";

type Version = { id: string; created_at: string; titulo: string | null };

type Props = {
  inicial: EditorProyecto;
  estado: EstadoProyecto | null;
  /** Fecha de publicación guardada, "AAAA-MM-DDTHH:mm" en hora de Madrid, o vacío. */
  fechaInicial: string;
  conocidas: { ruta: string; width: number; height: number }[];
  versiones: Version[];
  siteUrl: string;
  /** Imágenes que ya hay en public/projects, para elegirlas en vez de subirlas. */
  portadas: string[];
  /** Palabras que no se pueden nombrar (variable PALABRAS_PROHIBIDAS), leídas en el servidor. */
  prohibidas: string[];
};

type CampoTexto = Exclude<keyof CamposProyectoIdioma, "facts" | "results" | "quotePermiso">;
type DestinoSubida = "body" | "image" | "imageDark" | "ogImage";

const mono = "font-mono text-[13px] leading-relaxed";
const caja = "border-rule bg-paper-alt rounded-2xl border p-5 md:p-6";
const casilla = "mt-0.5 size-4 shrink-0 accent-[var(--accent)]";

/** ¿Lleva el idioma las tres marcas de un caso de ejemplo? */
function marcasCompletas(l: Locale, c: CamposProyectoIdioma): boolean {
  const e = EJEMPLO[l];
  return (
    c.desc.trim().startsWith(e.descInicio) &&
    c.facts[0]?.value.trim() === e.fact &&
    c.body.trimStart().startsWith(e.parrafo)
  );
}

/** Pega en un idioma las tres marcas del caso de ejemplo, con su texto exacto. */
function conMarcas(l: Locale, c: CamposProyectoIdioma): CamposProyectoIdioma {
  const e = EJEMPLO[l];
  const desc = c.desc.trim().startsWith(e.descInicio) ? c.desc : `${e.descInicio} ${c.desc}`.trim();
  const facts = c.facts.map((f) => ({ ...f }));
  facts[0] = { label: facts[0].label.trim() || (l === "es" ? "Tipo" : "Type"), value: e.fact };
  const cuerpo = c.body.trimStart();
  const body = cuerpo.startsWith(e.parrafo)
    ? c.body
    : cuerpo === ""
      ? e.parrafo
      : `${e.parrafo}\n\n${cuerpo}`;
  return { ...c, desc, facts, body };
}

const tieneTexto = (c: CamposProyectoIdioma) =>
  [c.title, c.tag, c.desc, c.postTitle, c.intro, c.body].some((x) => x.trim() !== "");

export function PortfolioEditor({
  inicial,
  estado: estadoInicial,
  fechaInicial,
  conocidas,
  versiones,
  siteUrl,
  portadas,
  prohibidas,
}: Props) {
  const { t, locale } = usePT();
  const router = useRouter();
  const [pendiente, empezar] = useTransition();

  const [p, setP] = useState<EditorProyecto>(inicial);
  const [idioma, setIdioma] = useState<Locale>("es");
  const [fecha, setFecha] = useState(fechaInicial);
  const [estado, setEstado] = useState<EstadoProyecto | null>(estadoInicial);
  const [guardado, setGuardado] = useState(() => JSON.stringify(inicial));
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);
  const [subiendo, setSubiendo] = useState<DestinoSubida | null>(null);
  const [tamanos, setTamanos] = useState<Map<string, TamanoImagen>>(
    () => new Map(conocidas.map((c) => [c.ruta, { width: c.width, height: c.height }])),
  );
  const [borrando, setBorrando] = useState(false);
  const [despublicando, setDespublicando] = useState(false);
  const [confirmarSlug, setConfirmarSlug] = useState("");
  const [copiada, setCopiada] = useState(false);

  const cuerpo = useRef<HTMLTextAreaElement>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const destino = useRef<DestinoSubida>("body");

  const sucio = JSON.stringify(p) !== guardado;

  // Aviso del navegador al salir con cambios sin guardar.
  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  const campos = p[idioma];
  const cambiar = (k: CampoTexto, v: string) =>
    setP((x) => ({ ...x, [idioma]: { ...x[idioma], [k]: v } }));
  const comun = <K extends "slug" | "service" | "cover" | "url" | "image" | "imageDark" | "coverPosition" | "ogImage">(
    k: K,
    v: string,
  ) => setP((x) => ({ ...x, [k]: v }));
  const cambiarFact = (i: number, k: "label" | "value", v: string) =>
    setP((x) => ({
      ...x,
      [idioma]: {
        ...x[idioma],
        facts: x[idioma].facts.map((f, j) => (j === i ? { ...f, [k]: v } : f)),
      },
    }));
  const cambiarResultado = (i: number, k: "label" | "before" | "after", v: string) =>
    setP((x) => ({
      ...x,
      [idioma]: {
        ...x[idioma],
        results: x[idioma].results.map((r, j) => (j === i ? { ...r, [k]: v } : r)),
      },
    }));
  const cambiarTech = (i: number, v: string) =>
    setP((x) => ({ ...x, tech: Array.from({ length: 4 }, (_, j) => (j === i ? v : (x.tech[j] ?? ""))) }));
  const alternarServicio = (s: string, on: boolean) =>
    setP((x) => ({
      ...x,
      enServicios: on ? [...x.enServicios.filter((e) => e !== s), s] : x.enServicios.filter((e) => e !== s),
    }));

  function alEjemplo(on: boolean) {
    setP((x) => {
      if (!on) return { ...x, ejemplo: false };
      // El inglés vacío se queda vacío: con solo las marcas contaría como "empezado" y el
      // comprobador pediría todo el artículo.
      return {
        ...x,
        ejemplo: true,
        es: conMarcas("es", x.es),
        en: tieneTexto(x.en) ? conMarcas("en", x.en) : x.en,
      };
    });
  }

  // Comprobador en vivo. useDeferredValue evita recalcular en cada pulsación mientras se escribe.
  const diferido = useDeferredValue(p);
  const analisis = useMemo(() => {
    const contenido = contenidoDeEditor(diferido, tamanos);
    const r = validarProyecto(
      {
        slug: diferido.slug,
        service: diferido.service,
        tech: diferido.tech.map((x) => x.trim()).filter((x) => x !== ""),
        enServicios: diferido.enServicios,
        image: diferido.image.trim() || null,
        imageDark: diferido.imageDark.trim() || null,
        ogImage: diferido.ogImage.trim() || null,
        ejemplo: diferido.ejemplo,
        datosProvisionales: diferido.datosProvisionales,
        es: contenido.es,
        en: contenido.en,
      },
      { publicar: true, prohibidas },
    );
    const palabras = (c: CamposProyectoIdioma) => contarPalabras(`${c.intro}\n${c.body}`);
    return { ...r, palabras: palabras(diferido[idioma]) };
  }, [diferido, tamanos, idioma, prohibidas]);

  const slugOk = slugValido(p.slug);
  const futura = fecha !== "" && (madridLocalAUtc(fecha)?.getTime() ?? 0) > Date.now();
  const urlPublica = `${siteUrl}/proyectos/${p.slug}`;
  const publicado = estado === "publicado" || estado === "programado";
  const aviso = (texto: string, error = false) => setMensaje({ texto, error });
  const tecnologias = Array.from({ length: 4 }, (_, i) => p.tech[i] ?? "");

  /** Guarda y devuelve el id, o null si falla (el mensaje ya queda puesto). */
  async function guardar(): Promise<string | null> {
    const r = await guardarProyecto(p);
    if (!r.ok || !r.id) {
      aviso(r.error ?? t("portfolio.err.saveFailed"), true);
      return null;
    }
    const conId = { ...p, id: r.id };
    setP(conId);
    setGuardado(JSON.stringify(conId));
    if (!p.id) router.replace(`/admin/portfolio/${r.id}`);
    return r.id;
  }

  const alGuardar = () =>
    empezar(async () => {
      setMensaje(null);
      if (await guardar()) aviso(t("portfolio.editor.saved"));
    });

  const alPublicar = () =>
    empezar(async () => {
      setMensaje(null);
      const id = await guardar();
      if (!id) return;
      const r = await publicarProyecto(id, fecha);
      if (!r.ok) {
        aviso(r.error ?? t("portfolio.err.saveFailed"), true);
        return;
      }
      setEstado(r.programado ? "programado" : "publicado");
      aviso(t("portfolio.editor.saved"));
    });

  const alDespublicar = () =>
    empezar(async () => {
      if (!p.id) return;
      const r = await despublicarProyecto(p.id);
      if (!r.ok) return aviso(r.error ?? t("portfolio.err.saveFailed"), true);
      setEstado("borrador");
      setDespublicando(false);
      aviso(t("portfolio.editor.unpublished"));
    });

  const alDuplicar = () =>
    empezar(async () => {
      if (!p.id) return;
      const r = await duplicarProyecto(p.id);
      if (!r.ok || !r.id) return aviso(r.error ?? t("portfolio.err.saveFailed"), true);
      router.push(`/admin/portfolio/${r.id}`);
    });

  const alBorrar = () =>
    empezar(async () => {
      if (!p.id) return;
      const r = await borrarProyecto(p.id, confirmarSlug);
      if (!r.ok) return aviso(r.error ?? t("portfolio.err.saveFailed"), true);
      setGuardado(JSON.stringify(p));
      router.push("/admin/portfolio");
    });

  const alRestaurar = (v: Version) => {
    if (!p.id || !window.confirm(t("portfolio.editor.restoreConfirm"))) return;
    empezar(async () => {
      const r = await restaurarVersion(p.id as string, v.id);
      if (!r.ok) return aviso(r.error ?? t("portfolio.err.saveFailed"), true);
      aviso(t("portfolio.editor.restored"));
      router.refresh();
    });
  };

  const alValidarCifras = () => {
    if (!window.confirm(t("portfolio.editor.validateConfirm"))) return;
    empezar(async () => {
      setMensaje(null);
      // Se guarda antes, así no se pierde lo escrito y la marca se aplica sobre lo último.
      const id = await guardar();
      if (!id) return;
      const r = await marcarCifrasValidadas(id);
      if (!r.ok) return aviso(r.error ?? t("portfolio.err.saveFailed"), true);
      const nuevo = { ...p, id, datosProvisionales: false };
      setP(nuevo);
      setGuardado(JSON.stringify(nuevo));
      aviso(t("portfolio.editor.validated"));
    });
  };

  function elegirArchivo(donde: DestinoSubida) {
    if (!slugOk) return aviso(t("portfolio.editor.uploadNeedSlug"), true);
    destino.current = donde;
    archivo.current?.click();
  }

  async function alSubirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!slugOk) return aviso(t("portfolio.editor.uploadNeedSlug"), true);
    const donde = destino.current;
    setSubiendo(donde);
    try {
      const datos = new FormData();
      datos.set("archivo", f);
      datos.set("slug", p.slug);
      const res = await fetch("/api/admin/portfolio/imagenes", { method: "POST", body: datos });
      const json = (await res.json().catch(() => ({}))) as {
        path?: string;
        width?: number;
        height?: number;
        error?: string;
      };
      if (!res.ok || !json.path || !json.width || !json.height) {
        return aviso(json.error ?? t("portfolio.editor.uploadFailed"), true);
      }
      const { path, width, height } = json;
      setTamanos((m) => new Map(m).set(path, { width, height }));
      if (donde !== "body") {
        comun(donde, path);
        return aviso(t("portfolio.editor.uploadDoneCover"));
      }
      // Se pega en el cursor, como párrafo propio (línea en blanco antes y después).
      const area = cuerpo.current;
      const texto = campos.body;
      const inicio = area?.selectionStart ?? texto.length;
      const fin = area?.selectionEnd ?? texto.length;
      const antes = texto.slice(0, inicio);
      const despues = texto.slice(fin);
      const marca = `![](${path})`;
      const relleno =
        antes === "" || antes.endsWith("\n\n") ? "" : antes.endsWith("\n") ? "\n" : "\n\n";
      const cierre =
        despues === "" || despues.startsWith("\n\n")
          ? ""
          : despues.startsWith("\n")
            ? "\n"
            : "\n\n";
      cambiar("body", `${antes}${relleno}${marca}${cierre}${despues}`);
      aviso(t("portfolio.editor.uploadDone"));
    } catch {
      aviso(t("portfolio.editor.uploadFailed"), true);
    } finally {
      setSubiendo(null);
    }
  }

  async function copiarUrl() {
    try {
      await navigator.clipboard.writeText(urlPublica);
      setCopiada(true);
      setTimeout(() => setCopiada(false), 2000);
    } catch {
      /* sin portapapeles: la URL sigue visible para copiarla a mano */
    }
  }

  const fechaLarga = (iso: string) =>
    new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    });

  const etiquetaRuta = (ruta: string) =>
    ruta.replace("sections", "sec").replace("blocks", "b").replace("caseStudy", "caso");
  const alIrARuta = (f: Fallo) => {
    if (f.ruta.startsWith("es.")) setIdioma("es");
    else if (f.ruta.startsWith("en.")) setIdioma("en");
  };

  const lista = (items: Fallo[], tono: "danger" | "warn") =>
    items.length === 0 ? null : (
      <ul className="mt-2 space-y-1.5 text-sm">
        {items.slice(0, 40).map((f, i) => (
          <li key={`${f.ruta}-${i}`}>
            <button
              type="button"
              onClick={() => alIrARuta(f)}
              className={`block w-full text-left ${tono === "danger" ? "text-[var(--danger)]" : "text-[var(--warn)]"}`}
            >
              <span className="block font-mono text-[11px] opacity-80">{etiquetaRuta(f.ruta)}</span>
              {f.mensaje}
            </button>
          </li>
        ))}
        {items.length > 40 ? <li className="text-muted">+{items.length - 40}</li> : null}
      </ul>
    );

  /** Campo de imagen: ruta escrita o elegida, y botón de subir. */
  const campoImagen = (id: string, k: "image" | "imageDark" | "ogImage", etiqueta: string, ayuda: string) => (
    <div>
      <label htmlFor={id} className={labelCls}>
        {etiqueta}
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          list={k === "ogImage" ? undefined : "portfolio-portadas"}
          className={`${inputCls} min-w-0 font-mono`}
          value={p[k]}
          onChange={(e) => comun(k, e.target.value)}
          spellCheck={false}
          autoCapitalize="none"
          aria-describedby={`${id}-ayuda`}
        />
        <button
          type="button"
          className="btn-secondary !px-3 !py-1.5 !text-sm whitespace-nowrap disabled:opacity-60"
          disabled={subiendo !== null}
          onClick={() => elegirArchivo(k)}
        >
          {subiendo === k ? t("portfolio.editor.uploading") : t("portfolio.editor.uploadImage")}
        </button>
      </div>
      <p id={`${id}-ayuda`} className="text-muted mt-1 text-xs">
        {ayuda}
      </p>
      {p[k].trim() !== "" ? (
        <div className="mt-2 flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- miniatura del admin, mismo origen */}
          <img
            src={p[k].trim()}
            alt={t("portfolio.editor.thumbAlt", { campo: etiqueta })}
            width={200}
            height={k === "ogImage" ? 105 : 125}
            className="border-rule h-auto w-full max-w-[200px] rounded-lg border"
          />
          <button
            type="button"
            className="text-muted hover:text-ink text-sm underline-offset-2 hover:underline"
            onClick={() => comun(k, "")}
          >
            {t("portfolio.editor.removeImage")}
          </button>
        </div>
      ) : null}
    </div>
  );

  const guardado0 = useMemo(() => JSON.parse(guardado) as EditorProyecto, [guardado]);
  const dondeSale = guardado0.enServicios.map((s) => `/servicios/${s}`).join(" y ");

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <datalist id="portfolio-portadas">
        {portadas.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <datalist id="portfolio-etiquetas">
        {ETIQUETAS_CONOCIDAS[idioma].map((e) => (
          <option key={e} value={e} />
        ))}
      </datalist>
      <input
        ref={archivo}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={alSubirImagen}
      />

      <div className="min-w-0 space-y-6">
        <section className={caja}>
          <h2 className="mb-4 text-lg font-semibold tracking-tight">{t("portfolio.editor.common")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="pf-slug" className={labelCls}>
                {t("portfolio.editor.slug")}
              </label>
              <input
                id="pf-slug"
                className={`${inputCls} font-mono`}
                value={p.slug}
                onChange={(e) => comun("slug", e.target.value)}
                readOnly={publicado}
                spellCheck={false}
                autoCapitalize="none"
                aria-describedby="pf-slug-ayuda"
              />
              <p id="pf-slug-ayuda" className="text-muted mt-1 text-xs">
                {t("portfolio.editor.slugHelp")}
              </p>
            </div>
            <div>
              <label htmlFor="pf-servicio" className={labelCls}>
                {t("portfolio.editor.service")}
              </label>
              <select
                id="pf-servicio"
                className={inputCls}
                value={p.service}
                onChange={(e) => comun("service", e.target.value)}
                aria-describedby="pf-servicio-ayuda"
              >
                {SERVICIOS.map((s) => (
                  <option key={s} value={s}>
                    {t(`portfolio.service.${s}`)}
                  </option>
                ))}
              </select>
              <p id="pf-servicio-ayuda" className="text-muted mt-1 text-xs">
                {t("portfolio.editor.serviceHelp")}
              </p>
            </div>

            <fieldset className="md:col-span-2">
              <legend className={labelCls}>{t("portfolio.editor.tech")}</legend>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {tecnologias.map((x, i) => (
                  <input
                    key={i}
                    className={inputCls}
                    value={x}
                    onChange={(e) => cambiarTech(i, e.target.value)}
                    aria-label={t("portfolio.editor.techN", { n: i + 1 })}
                  />
                ))}
              </div>
              <p className="text-muted mt-1 text-xs">{t("portfolio.editor.techHelp")}</p>
            </fieldset>

            <div>
              <label htmlFor="pf-cover" className={labelCls}>
                {t("portfolio.editor.cover")}
              </label>
              <input
                id="pf-cover"
                className={`${inputCls} font-mono`}
                value={p.cover}
                onChange={(e) => comun("cover", e.target.value)}
                spellCheck={false}
                aria-describedby="pf-cover-ayuda"
              />
              <p id="pf-cover-ayuda" className="text-muted mt-1 text-xs">
                {t("portfolio.editor.coverHelp")}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pf-tinte" className={labelCls}>
                  {t("portfolio.editor.tint")}
                </label>
                <input
                  id="pf-tinte"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  className={inputCls}
                  value={p.tint}
                  onChange={(e) => setP((x) => ({ ...x, tint: Math.round(Number(e.target.value) || 0) }))}
                />
              </div>
              <div>
                <label htmlFor="pf-pos" className={labelCls}>
                  {t("portfolio.editor.coverPosition")}
                </label>
                <select
                  id="pf-pos"
                  className={inputCls}
                  value={p.coverPosition}
                  onChange={(e) => comun("coverPosition", e.target.value)}
                >
                  <option value="">{t("portfolio.editor.posDefault")}</option>
                  <option value="top">{t("portfolio.editor.posTop")}</option>
                  <option value="center">{t("portfolio.editor.posCenter")}</option>
                </select>
              </div>
            </div>

            {campoImagen("pf-imagen", "image", t("portfolio.editor.image"), t("portfolio.editor.imageHelp"))}
            {campoImagen(
              "pf-imagen-oscura",
              "imageDark",
              t("portfolio.editor.imageDark"),
              t("portfolio.editor.imageDarkHelp"),
            )}
            {campoImagen("pf-og", "ogImage", t("portfolio.editor.ogImage"), t("portfolio.editor.ogHelp"))}

            <div>
              <label htmlFor="pf-url" className={labelCls}>
                {t("portfolio.editor.url")}
              </label>
              <input
                id="pf-url"
                type="url"
                className={`${inputCls} font-mono`}
                value={p.url}
                onChange={(e) => comun("url", e.target.value)}
                spellCheck={false}
                aria-describedby="pf-url-ayuda"
              />
              <p id="pf-url-ayuda" className="text-muted mt-1 text-xs">
                {t("portfolio.editor.urlHelp")}
              </p>
            </div>

            <fieldset className="md:col-span-2">
              <legend className={labelCls}>{t("portfolio.editor.showIn")}</legend>
              <div className="space-y-2">
                {SERVICIOS.map((s) => (
                  <label key={s} className="flex items-start gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      className={casilla}
                      checked={p.enServicios.includes(s)}
                      onChange={(e) => alternarServicio(s, e.target.checked)}
                    />
                    <span>{t("portfolio.editor.showInService", { ruta: `/servicios/${s}` })}</span>
                  </label>
                ))}
              </div>
              <p className="text-muted mt-1 text-xs">{t("portfolio.editor.showInHelp")}</p>
            </fieldset>

            <fieldset className="md:col-span-2">
              <legend className={labelCls}>{t("portfolio.editor.flags")}</legend>
              <div className="space-y-3">
                <label className="flex items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    className={casilla}
                    checked={p.ejemplo}
                    onChange={(e) => alEjemplo(e.target.checked)}
                  />
                  <span>
                    {t("portfolio.editor.example")}
                    <span className="text-muted block text-xs">{t("portfolio.editor.exampleHelp")}</span>
                  </span>
                </label>
                <label className="flex items-start gap-2.5 text-sm">
                  <input
                    type="checkbox"
                    className={casilla}
                    checked={p.datosProvisionales}
                    onChange={(e) => setP((x) => ({ ...x, datosProvisionales: e.target.checked }))}
                  />
                  <span>
                    {t("portfolio.editor.provisional")}
                    <span className="text-muted block text-xs">
                      {t("portfolio.editor.provisionalHelp")}
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>
          </div>
        </section>

        <section className={caja}>
          <div
            role="tablist"
            aria-label={t("portfolio.editor.tabsLabel")}
            className="mb-5 flex gap-1 border-b border-[var(--rule)]"
          >
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                id={`pf-tab-${l}`}
                aria-selected={idioma === l}
                aria-controls="pf-panel"
                onClick={() => setIdioma(l)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${idioma === l ? "text-ink border-[var(--accent)]" : "text-muted hover:text-ink border-transparent"}`}
              >
                {l === "es" ? t("portfolio.editor.tabEs") : t("portfolio.editor.tabEn")}
              </button>
            ))}
          </div>

          <div id="pf-panel" role="tabpanel" aria-labelledby={`pf-tab-${idioma}`} className="space-y-6">
            {idioma === "en" && !tieneTexto(p.en) ? (
              <p className="border-rule text-muted rounded-xl border px-4 py-3 text-sm">
                {t("portfolio.editor.englishEmpty")}
              </p>
            ) : null}
            {p.ejemplo && !marcasCompletas(idioma, campos) ? (
              <p className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--warn)] px-4 py-3 text-sm text-[var(--warn)]">
                <span>{t("portfolio.editor.marksMissing")}</span>
                <button
                  type="button"
                  className="btn-secondary !px-3 !py-1 !text-xs"
                  onClick={() => setP((x) => ({ ...x, [idioma]: conMarcas(idioma, x[idioma]) }))}
                >
                  {t("portfolio.editor.marksApply")}
                </button>
              </p>
            ) : null}

            <fieldset className="space-y-4">
              <legend className="mb-1 text-base font-semibold">{t("portfolio.editor.cardGroup")}</legend>
              <div>
                <label htmlFor="pf-titulo" className={labelCls}>
                  {t("portfolio.editor.fieldTitle")}
                </label>
                <input
                  id="pf-titulo"
                  className={inputCls}
                  value={campos.title}
                  onChange={(e) => cambiar("title", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pf-tag" className={labelCls}>
                  {t("portfolio.editor.tag")}
                </label>
                <input
                  id="pf-tag"
                  list="portfolio-etiquetas"
                  className={inputCls}
                  value={campos.tag}
                  onChange={(e) => cambiar("tag", e.target.value)}
                  aria-describedby="pf-tag-ayuda"
                />
                <p id="pf-tag-ayuda" className="text-muted mt-1 text-xs">
                  {t("portfolio.editor.tagHelp")}
                </p>
              </div>
              <div>
                <label htmlFor="pf-desc" className={labelCls}>
                  {t("portfolio.editor.desc")}
                </label>
                <textarea
                  id="pf-desc"
                  rows={3}
                  className={inputCls}
                  value={campos.desc}
                  onChange={(e) => cambiar("desc", e.target.value)}
                  aria-describedby="pf-desc-ayuda"
                />
                <p id="pf-desc-ayuda" className="text-muted mt-1 text-xs">
                  {t("portfolio.editor.descHelp")}
                </p>
              </div>
              <div>
                <label htmlFor="pf-alt" className={labelCls}>
                  {t("portfolio.editor.coverAlt")}
                </label>
                <input
                  id="pf-alt"
                  className={inputCls}
                  value={campos.coverAlt}
                  onChange={(e) => cambiar("coverAlt", e.target.value)}
                  aria-describedby="pf-alt-ayuda"
                />
                <p id="pf-alt-ayuda" className="text-muted mt-1 text-xs">
                  {t("portfolio.editor.coverAltHelp")}
                </p>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="mb-1 text-base font-semibold">{t("portfolio.editor.articleGroup")}</legend>
              <div>
                <label htmlFor="pf-titulo-largo" className={labelCls}>
                  {t("portfolio.editor.postTitle")}
                </label>
                <input
                  id="pf-titulo-largo"
                  className={inputCls}
                  value={campos.postTitle}
                  onChange={(e) => cambiar("postTitle", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pf-seo" className={labelCls}>
                  {t("portfolio.editor.seoTitle")}
                </label>
                <input
                  id="pf-seo"
                  className={inputCls}
                  value={campos.seoTitle}
                  onChange={(e) => cambiar("seoTitle", e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="pf-intro" className={labelCls}>
                  {t("portfolio.editor.intro")}
                </label>
                <textarea
                  id="pf-intro"
                  rows={4}
                  className={inputCls}
                  value={campos.intro}
                  onChange={(e) => cambiar("intro", e.target.value)}
                />
              </div>
              <div>
                <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                  <label htmlFor="pf-cuerpo" className="block text-sm font-medium">
                    {t("portfolio.editor.body")}
                  </label>
                  <button
                    type="button"
                    className="btn-secondary !px-3 !py-1.5 !text-sm disabled:opacity-60"
                    disabled={subiendo !== null}
                    onClick={() => elegirArchivo("body")}
                  >
                    {subiendo === "body" ? t("portfolio.editor.uploading") : t("portfolio.editor.uploadBodyImage")}
                  </button>
                </div>
                <textarea
                  id="pf-cuerpo"
                  ref={cuerpo}
                  rows={28}
                  spellCheck
                  className={`${inputCls} ${mono}`}
                  value={campos.body}
                  onChange={(e) => cambiar("body", e.target.value)}
                  aria-describedby="pf-cuerpo-ayuda"
                />
                <p id="pf-cuerpo-ayuda" className="text-muted mt-1 text-xs">
                  {t("portfolio.editor.bodyHelp")}
                </p>
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="mb-1 text-base font-semibold">{t("portfolio.editor.facts")}</legend>
              <p className="text-muted text-xs">{t("portfolio.editor.factsHelp")}</p>
              {campos.facts.map((f, i) => (
                <div key={i} className="grid gap-3 md:grid-cols-[10rem_minmax(0,1fr)]">
                  <input
                    className={inputCls}
                    value={f.label}
                    onChange={(e) => cambiarFact(i, "label", e.target.value)}
                    aria-label={t("portfolio.editor.factLabel", { n: i + 1 })}
                    placeholder={t("portfolio.editor.factLabelPh")}
                  />
                  <input
                    className={inputCls}
                    value={f.value}
                    onChange={(e) => cambiarFact(i, "value", e.target.value)}
                    aria-label={t("portfolio.editor.factValue", { n: i + 1 })}
                  />
                </div>
              ))}
            </fieldset>

            <details className="border-rule rounded-xl border px-4 py-3" open={campos.context !== "" || campos.role !== "" || campos.results.length > 0 || campos.quoteText !== ""}>
              <summary className="cursor-pointer text-base font-semibold">
                {t("portfolio.editor.caseTitle")}
              </summary>
              <div className="mt-4 space-y-4">
                <p className="text-muted text-xs">{t("portfolio.editor.caseHelp")}</p>
                <div>
                  <label htmlFor="pf-contexto" className={labelCls}>
                    {t("portfolio.editor.context")}
                  </label>
                  <textarea
                    id="pf-contexto"
                    rows={3}
                    className={inputCls}
                    value={campos.context}
                    onChange={(e) => cambiar("context", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="pf-papel" className={labelCls}>
                    {t("portfolio.editor.role")}
                  </label>
                  <textarea
                    id="pf-papel"
                    rows={3}
                    className={inputCls}
                    value={campos.role}
                    onChange={(e) => cambiar("role", e.target.value)}
                  />
                </div>

                <fieldset className="space-y-3">
                  <legend className={labelCls}>{t("portfolio.editor.results")}</legend>
                  {campos.results.map((r, i) => (
                    <div key={i} className="grid gap-2 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <input
                        className={inputCls}
                        value={r.label}
                        onChange={(e) => cambiarResultado(i, "label", e.target.value)}
                        aria-label={t("portfolio.editor.resultLabel", { n: i + 1 })}
                        placeholder={t("portfolio.editor.resultLabelPh")}
                      />
                      <input
                        className={inputCls}
                        value={r.before}
                        onChange={(e) => cambiarResultado(i, "before", e.target.value)}
                        aria-label={t("portfolio.editor.resultBefore", { n: i + 1 })}
                        placeholder={t("portfolio.editor.resultBeforePh")}
                      />
                      <input
                        className={inputCls}
                        value={r.after}
                        onChange={(e) => cambiarResultado(i, "after", e.target.value)}
                        aria-label={t("portfolio.editor.resultAfter", { n: i + 1 })}
                        placeholder={t("portfolio.editor.resultAfterPh")}
                      />
                      <button
                        type="button"
                        className="text-muted px-2 text-sm underline-offset-2 hover:text-[var(--danger)] hover:underline"
                        onClick={() =>
                          setP((x) => ({
                            ...x,
                            [idioma]: { ...x[idioma], results: x[idioma].results.filter((_, j) => j !== i) },
                          }))
                        }
                      >
                        {t("portfolio.editor.removeResult", { n: i + 1 })}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn-secondary !px-3 !py-1.5 !text-sm"
                    onClick={() =>
                      setP((x) => ({
                        ...x,
                        [idioma]: { ...x[idioma], results: [...x[idioma].results, { label: "", before: "", after: "" }] },
                      }))
                    }
                  >
                    {t("portfolio.editor.addResult")}
                  </button>
                </fieldset>

                <div>
                  <label htmlFor="pf-fragmento-titulo" className={labelCls}>
                    {t("portfolio.editor.snippetTitle")}
                  </label>
                  <input
                    id="pf-fragmento-titulo"
                    className={inputCls}
                    value={campos.snippetTitle}
                    onChange={(e) => cambiar("snippetTitle", e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="pf-fragmento" className={labelCls}>
                    {t("portfolio.editor.snippetCode")}
                  </label>
                  <textarea
                    id="pf-fragmento"
                    rows={6}
                    spellCheck={false}
                    className={`${inputCls} ${mono}`}
                    value={campos.snippetCode}
                    onChange={(e) => cambiar("snippetCode", e.target.value)}
                    aria-describedby="pf-fragmento-ayuda"
                  />
                  <p id="pf-fragmento-ayuda" className="text-muted mt-1 text-xs">
                    {t("portfolio.editor.snippetHelp")}
                  </p>
                </div>

                <fieldset className="space-y-3">
                  <legend className={labelCls}>{t("portfolio.editor.quote")}</legend>
                  <textarea
                    rows={3}
                    className={inputCls}
                    value={campos.quoteText}
                    onChange={(e) => cambiar("quoteText", e.target.value)}
                    aria-label={t("portfolio.editor.quoteText")}
                    placeholder={t("portfolio.editor.quoteText")}
                  />
                  <input
                    className={inputCls}
                    value={campos.quoteAuthor}
                    onChange={(e) => cambiar("quoteAuthor", e.target.value)}
                    aria-label={t("portfolio.editor.quoteAuthor")}
                    placeholder={t("portfolio.editor.quoteAuthor")}
                  />
                  <label className="flex items-start gap-2.5 text-sm">
                    <input
                      type="checkbox"
                      className={casilla}
                      checked={campos.quotePermiso}
                      onChange={(e) =>
                        setP((x) => ({ ...x, [idioma]: { ...x[idioma], quotePermiso: e.target.checked } }))
                      }
                    />
                    <span>{t("portfolio.editor.quotePermiso")}</span>
                  </label>
                </fieldset>
              </div>
            </details>
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4">
        <section className="border-rule bg-paper-alt rounded-2xl border p-5">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary disabled:opacity-60" disabled={pendiente} onClick={alGuardar}>
              {pendiente
                ? t("portfolio.editor.saving")
                : estado
                  ? t("portfolio.editor.saveChanges")
                  : t("portfolio.editor.save")}
            </button>
            {p.id ? (
              <Link
                href={`/admin/portfolio/${p.id}/vista`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                {t("portfolio.editor.preview")}
              </Link>
            ) : (
              <span className="text-muted self-center text-xs">{t("portfolio.editor.previewNeedsSave")}</span>
            )}
          </div>

          {!publicado ? (
            <div className="mt-4 border-t border-[var(--rule)] pt-4">
              {/* La fecha de publicación va aquí, junto al botón: vacío es ahora y una futura programa. */}
              <label htmlFor="pf-fecha" className={labelCls}>
                {t("portfolio.editor.publishOn")}
              </label>
              <input
                id="pf-fecha"
                type="datetime-local"
                className={inputCls}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                aria-describedby="pf-fecha-ayuda"
              />
              <p id="pf-fecha-ayuda" className="text-muted mt-1 text-xs">
                {t("portfolio.editor.publishOnHelp")}
              </p>
              <button
                type="button"
                className="btn-primary mt-3 disabled:opacity-60"
                disabled={pendiente || analisis.errores.length > 0}
                onClick={alPublicar}
              >
                {pendiente
                  ? t("portfolio.editor.publishing")
                  : futura
                    ? t("portfolio.editor.schedule")
                    : t("portfolio.editor.publish")}
              </button>
            </div>
          ) : (
            <div className="mt-3">
              <button
                type="button"
                className="btn-secondary disabled:opacity-60"
                disabled={pendiente}
                onClick={() => setDespublicando((d) => !d)}
                aria-expanded={despublicando}
              >
                {t("portfolio.editor.unpublish")}
              </button>
            </div>
          )}

          {despublicando && publicado ? (
            <div className="mt-3 rounded-xl border border-[var(--warn)] p-3 text-sm">
              <p className="font-medium">{t("portfolio.editor.unpublishTitle")}</p>
              <ul className="text-muted mt-1.5 list-disc space-y-1 pl-5">
                <li>{t("portfolio.editor.unpublish404", { slug: p.slug })}</li>
                <li>{t("portfolio.editor.unpublishHome")}</li>
                {guardado0.enServicios.length > 0 ? (
                  <li>{t("portfolio.editor.unpublishServices", { rutas: dondeSale })}</li>
                ) : null}
              </ul>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="btn-primary disabled:opacity-60"
                  disabled={pendiente}
                  onClick={alDespublicar}
                >
                  {t("portfolio.editor.unpublishConfirm")}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setDespublicando(false)}>
                  {t("portfolio.editor.cancel")}
                </button>
              </div>
            </div>
          ) : null}

          <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
            {mensaje ? (
              <span className={mensaje.error ? "text-[var(--danger)]" : "text-muted"}>{mensaje.texto}</span>
            ) : sucio ? (
              <span className="text-muted">{t("portfolio.editor.unsaved")}</span>
            ) : null}
          </p>

          {p.id && p.datosProvisionales ? (
            <div className="mt-3 rounded-xl border border-[var(--warn)] p-3 text-sm">
              <p className="text-[var(--warn)]">{t("portfolio.editor.provisionalNotice")}</p>
              <button
                type="button"
                className="btn-secondary mt-2 !px-3 !py-1.5 !text-sm disabled:opacity-60"
                disabled={pendiente}
                onClick={alValidarCifras}
              >
                {t("portfolio.editor.validateFigures")}
              </button>
            </div>
          ) : null}

          {p.id ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--rule)] pt-3 text-sm">
              <button
                type="button"
                className="text-muted hover:text-ink underline-offset-2 hover:underline"
                onClick={alDuplicar}
                disabled={pendiente}
              >
                {t("portfolio.editor.duplicate")}
              </button>
              <button
                type="button"
                className="text-muted underline-offset-2 hover:text-[var(--danger)] hover:underline"
                onClick={() => setBorrando((b) => !b)}
              >
                {t("portfolio.editor.delete")}
              </button>
            </div>
          ) : null}
          {borrando && p.id ? (
            <div className="mt-3 rounded-xl border border-[var(--danger)] p-3 text-sm">
              <p>
                {publicado
                  ? t("portfolio.editor.deleteConfirmSlug", { slug: p.slug })
                  : t("portfolio.editor.deleteConfirmDraft")}
              </p>
              {publicado ? (
                <input
                  className={`${inputCls} mt-2 font-mono`}
                  value={confirmarSlug}
                  onChange={(e) => setConfirmarSlug(e.target.value)}
                  aria-label={t("portfolio.editor.slug")}
                  spellCheck={false}
                />
              ) : null}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="btn-primary !bg-[var(--danger)] disabled:opacity-60"
                  disabled={pendiente || (publicado && confirmarSlug !== p.slug)}
                  onClick={alBorrar}
                >
                  {t("portfolio.editor.deleteConfirmButton")}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setBorrando(false)}>
                  {t("portfolio.editor.cancel")}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {publicado ? (
          <section className="border-rule bg-paper-alt rounded-2xl border p-5">
            <h2 className="text-base font-semibold">
              {estado === "programado" ? t("portfolio.editor.scheduledTitle") : t("portfolio.editor.publishedTitle")}
            </h2>
            {estado === "programado" && fecha ? (
              <p className="text-muted mt-1 text-sm">
                {t("portfolio.editor.scheduledFor", {
                  fecha: fechaLarga(madridLocalAUtc(fecha)?.toISOString() ?? ""),
                })}
              </p>
            ) : null}
            <p className="text-muted mt-3 text-xs">{t("portfolio.editor.publicUrl")}</p>
            <p className="font-mono text-[13px] break-all">{urlPublica}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary !px-3 !py-1.5 !text-sm" onClick={copiarUrl}>
                {copiada ? t("portfolio.editor.copied") : t("portfolio.editor.copyUrl")}
              </button>
              <a
                className="btn-secondary !px-3 !py-1.5 !text-sm"
                href={`https://search.google.com/search-console/inspect?resource_id=sc-domain:angel-fernandez.es&id=${encodeURIComponent(urlPublica)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("portfolio.editor.searchConsole")}
              </a>
            </div>
            <p className="text-muted mt-2 text-xs">{t("portfolio.editor.searchConsoleHelp")}</p>
          </section>
        ) : null}

        <section className="border-rule bg-paper-alt rounded-2xl border p-5" aria-live="polite">
          <h2 className="text-base font-semibold">{t("portfolio.editor.checkerTitle")}</h2>
          <p className="text-muted mt-1 text-sm">
            {t("portfolio.editor.words", { n: analisis.palabras })} ({idioma.toUpperCase()})
          </p>
          {analisis.errores.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--positive)]">{t("portfolio.editor.checkerOk")}</p>
          ) : (
            <div className="mt-3">
              <p className="text-sm font-medium text-[var(--danger)]">
                {t("portfolio.editor.checkerErrors")} ({analisis.errores.length})
              </p>
              {lista(analisis.errores, "danger")}
            </div>
          )}
          {analisis.avisos.length > 0 ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-[var(--warn)]">
                {t("portfolio.editor.checkerWarnings")} ({analisis.avisos.length})
              </p>
              {lista(analisis.avisos, "warn")}
            </div>
          ) : null}
        </section>

        {p.id ? (
          <section className="border-rule bg-paper-alt rounded-2xl border p-5">
            <h2 className="text-base font-semibold">{t("portfolio.editor.historyTitle")}</h2>
            {versiones.length === 0 ? (
              <p className="text-muted mt-2 text-sm">{t("portfolio.editor.historyEmpty")}</p>
            ) : (
              <ul className="mt-2 divide-y divide-[var(--rule)]">
                {versiones.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                    <span className="min-w-0">
                      <span className="block">{fechaLarga(v.created_at)}</span>
                      <span className="text-muted block truncate text-xs">{v.titulo}</span>
                    </span>
                    <button
                      type="button"
                      className="btn-secondary !px-3 !py-1 !text-xs"
                      disabled={pendiente}
                      onClick={() => alRestaurar(v)}
                    >
                      {t("portfolio.editor.restore")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </aside>
    </div>
  );
}
