"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  borrarPost,
  despublicarPost,
  duplicarPost,
  guardarPost,
  publicarPost,
  restaurarVersion,
} from "@/lib/blog-actions";
import { contenidoDeEditor, type CamposIdioma, type EditorPost } from "@/lib/blog-editor";
import { CATEGORIAS, palabrasDe, validarPost, type Fallo } from "@/lib/blog-validate";
import { madridLocalAUtc, readingMinutes } from "@/lib/blog-types";
import type { EstadoBlog } from "@/lib/blog-admin";
import type { Locale } from "@/lib/i18n";
import type { TamanoImagen } from "@/lib/blog-markup";
import { inputCls, labelCls } from "./styles";
import { usePT } from "./i18n-provider";

type Version = { id: string; created_at: string; titulo: string | null };

type Props = {
  inicial: EditorPost;
  estado: EstadoBlog | null;
  /** Fecha de publicación guardada, "AAAA-MM-DDTHH:mm" en hora de Madrid, o vacío. */
  fechaInicial: string;
  conocidas: { ruta: string; width: number; height: number }[];
  versiones: Version[];
  siteUrl: string;
  /** created_by del artículo guardado (vacío si es nuevo). */
  creadoPor?: string;
};

const mono = "font-mono text-[13px] leading-relaxed";

export function BlogEditor({
  inicial,
  estado: estadoInicial,
  fechaInicial,
  conocidas,
  versiones,
  siteUrl,
  creadoPor,
}: Props) {
  const { t, locale } = usePT();
  const router = useRouter();
  const [pendiente, empezar] = useTransition();

  const [post, setPost] = useState<EditorPost>(inicial);
  const [idioma, setIdioma] = useState<Locale>("es");
  const [fecha, setFecha] = useState(fechaInicial);
  const [estado, setEstado] = useState<EstadoBlog | null>(estadoInicial);
  const [guardado, setGuardado] = useState(() => JSON.stringify(inicial));
  const [mensaje, setMensaje] = useState<{ texto: string; error: boolean } | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [tamanos, setTamanos] = useState<Map<string, TamanoImagen>>(
    () => new Map(conocidas.map((c) => [c.ruta, { width: c.width, height: c.height }])),
  );
  const [borrando, setBorrando] = useState(false);
  const [confirmarSlug, setConfirmarSlug] = useState("");
  const [copiada, setCopiada] = useState(false);

  const cuerpo = useRef<HTMLTextAreaElement>(null);
  const archivo = useRef<HTMLInputElement>(null);

  const sucio = JSON.stringify(post) !== guardado;

  // Aviso del navegador al salir con cambios sin guardar.
  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  const campos = post[idioma];
  const cambiar = (k: keyof CamposIdioma, v: string) =>
    setPost((p) => ({ ...p, [idioma]: { ...p[idioma], [k]: v } }));
  const comun = (k: "slug" | "category" | "ogImage", v: string) =>
    setPost((p) => ({ ...p, [k]: v }));

  // Comprobador en vivo. useDeferredValue evita recalcular en cada pulsación mientras se escribe.
  const diferido = useDeferredValue(post);
  const analisis = useMemo(() => {
    const contenido = contenidoDeEditor(diferido, tamanos);
    const r = validarPost(
      {
        slug: diferido.slug,
        category: diferido.category,
        ogImage: diferido.ogImage.trim() || null,
        creadoPor,
        es: contenido.es,
        en: contenido.en,
      },
      { publicar: true },
    );
    return {
      ...r,
      palabras: palabrasDe(contenido[idioma]),
      minutos: readingMinutes(contenido[idioma]),
    };
  }, [diferido, tamanos, idioma, creadoPor]);

  const slugOk = !analisis.errores.some((e) => e.ruta === "slug") && post.slug !== "";
  const futura = fecha !== "" && (madridLocalAUtc(fecha)?.getTime() ?? 0) > Date.now();
  const urlPublica = `${siteUrl}/blog/${post.slug}`;
  const publicado = estado === "publicado" || estado === "programado";

  const aviso = (texto: string, error = false) => setMensaje({ texto, error });

  /** Guarda y devuelve el id, o null si falla (el mensaje ya queda puesto). */
  async function guardar(): Promise<string | null> {
    const r = await guardarPost(post);
    if (!r.ok || !r.id) {
      aviso(r.error ?? t("blog.err.saveFailed"), true);
      return null;
    }
    const conId = { ...post, id: r.id };
    setPost(conId);
    setGuardado(JSON.stringify(conId));
    if (!post.id) router.replace(`/admin/blog/${r.id}`);
    return r.id;
  }

  const alGuardar = () =>
    empezar(async () => {
      setMensaje(null);
      if (await guardar()) aviso(t("blog.editor.saved"));
    });

  const alPublicar = () =>
    empezar(async () => {
      setMensaje(null);
      const id = await guardar();
      if (!id) return;
      const r = await publicarPost(id, fecha);
      if (!r.ok) {
        aviso(r.error ?? t("blog.err.saveFailed"), true);
        return;
      }
      setEstado(r.programado ? "programado" : "publicado");
      aviso(t("blog.editor.saved"));
    });

  const alDespublicar = () =>
    empezar(async () => {
      if (!post.id) return;
      const r = await despublicarPost(post.id);
      if (!r.ok) return aviso(r.error ?? t("blog.err.saveFailed"), true);
      setEstado("borrador");
      aviso(t("blog.editor.unpublished"));
    });

  const alDuplicar = () =>
    empezar(async () => {
      if (!post.id) return;
      const r = await duplicarPost(post.id);
      if (!r.ok || !r.id) return aviso(r.error ?? t("blog.err.saveFailed"), true);
      router.push(`/admin/blog/${r.id}`);
    });

  const alBorrar = () =>
    empezar(async () => {
      if (!post.id) return;
      const r = await borrarPost(post.id, confirmarSlug);
      if (!r.ok) return aviso(r.error ?? t("blog.err.saveFailed"), true);
      setGuardado(JSON.stringify(post));
      router.push("/admin/blog");
    });

  const alRestaurar = (v: Version) => {
    if (!post.id || !window.confirm(t("blog.editor.restoreConfirm"))) return;
    empezar(async () => {
      const r = await restaurarVersion(post.id as string, v.id);
      if (!r.ok) return aviso(r.error ?? t("blog.err.saveFailed"), true);
      aviso(t("blog.editor.restored"));
      router.refresh();
    });
  };

  async function alSubirImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (!slugOk) return aviso(t("blog.editor.uploadNeedSlug"), true);
    setSubiendo(true);
    try {
      const datos = new FormData();
      datos.set("archivo", f);
      datos.set("slug", post.slug);
      const res = await fetch("/api/admin/blog/imagen", { method: "POST", body: datos });
      const json = (await res.json().catch(() => ({}))) as {
        path?: string;
        width?: number;
        height?: number;
        error?: string;
      };
      if (!res.ok || !json.path || !json.width || !json.height) {
        return aviso(json.error ?? t("blog.editor.uploadFailed"), true);
      }
      const { path, width, height } = json;
      setTamanos((m) => new Map(m).set(path, { width, height }));
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
      aviso(t("blog.editor.uploadDone"));
    } catch {
      aviso(t("blog.editor.uploadFailed"), true);
    } finally {
      setSubiendo(false);
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

  const cuentaDescripcion = Array.from(campos.description.trim()).length;
  const descripcionOk = cuentaDescripcion >= 120 && cuentaDescripcion <= 155;
  const fechaLarga = (iso: string) =>
    new Date(iso).toLocaleString(locale === "en" ? "en-GB" : "es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Madrid",
    });

  const etiquetaRuta = (ruta: string) => ruta.replace("sections", "sec").replace("blocks", "b");
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

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-6">
        <section className="border-rule bg-paper-alt rounded-2xl border p-5 md:p-6">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">{t("blog.editor.common")}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="blog-slug" className={labelCls}>
                {t("blog.editor.slug")}
              </label>
              <input
                id="blog-slug"
                className={`${inputCls} font-mono`}
                value={post.slug}
                onChange={(e) => comun("slug", e.target.value)}
                readOnly={publicado}
                spellCheck={false}
                autoCapitalize="none"
                aria-describedby="blog-slug-ayuda"
              />
              <p id="blog-slug-ayuda" className="text-muted mt-1 text-xs">
                {t("blog.editor.slugHelp")}
              </p>
            </div>
            <div>
              <label htmlFor="blog-categoria" className={labelCls}>
                {t("blog.editor.category")}
              </label>
              <select
                id="blog-categoria"
                className={inputCls}
                value={post.category}
                onChange={(e) => comun("category", e.target.value)}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {t(`blog.cat.${c}`)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="blog-fecha" className={labelCls}>
                {t("blog.editor.date")}
              </label>
              <input
                id="blog-fecha"
                type="datetime-local"
                className={inputCls}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                aria-describedby="blog-fecha-ayuda"
              />
              <p id="blog-fecha-ayuda" className="text-muted mt-1 text-xs">
                {t("blog.editor.dateHelp")}
              </p>
            </div>
            <div>
              <label htmlFor="blog-og" className={labelCls}>
                {t("blog.editor.ogImage")}
              </label>
              <input
                id="blog-og"
                className={`${inputCls} font-mono`}
                value={post.ogImage}
                onChange={(e) => comun("ogImage", e.target.value)}
                spellCheck={false}
                aria-describedby="blog-og-ayuda"
              />
              <p id="blog-og-ayuda" className="text-muted mt-1 text-xs">
                {t("blog.editor.ogHelp")}
              </p>
            </div>
          </div>
        </section>

        <section className="border-rule bg-paper-alt rounded-2xl border p-5 md:p-6">
          <div
            role="tablist"
            aria-label={t("blog.editor.tabsLabel")}
            className="mb-5 flex gap-1 border-b border-[var(--rule)]"
          >
            {(["es", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                role="tab"
                id={`blog-tab-${l}`}
                aria-selected={idioma === l}
                aria-controls="blog-panel"
                onClick={() => setIdioma(l)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors ${idioma === l ? "text-ink border-[var(--accent)]" : "text-muted hover:text-ink border-transparent"}`}
              >
                {l === "es" ? t("blog.editor.tabEs") : t("blog.editor.tabEn")}
              </button>
            ))}
          </div>

          <div
            id="blog-panel"
            role="tabpanel"
            aria-labelledby={`blog-tab-${idioma}`}
            className="space-y-4"
          >
            <div>
              <label htmlFor="blog-titulo" className={labelCls}>
                {t("blog.editor.fieldTitle")}
              </label>
              <input
                id="blog-titulo"
                className={inputCls}
                value={campos.title}
                onChange={(e) => cambiar("title", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="blog-seo" className={labelCls}>
                {t("blog.editor.seoTitle")}
              </label>
              <input
                id="blog-seo"
                className={inputCls}
                value={campos.seoTitle}
                onChange={(e) => cambiar("seoTitle", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="blog-resumen" className={labelCls}>
                {t("blog.editor.excerpt")}
              </label>
              <textarea
                id="blog-resumen"
                rows={3}
                className={inputCls}
                value={campos.excerpt}
                onChange={(e) => cambiar("excerpt", e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="blog-desc" className={labelCls}>
                {t("blog.editor.description")}
              </label>
              <textarea
                id="blog-desc"
                rows={3}
                className={inputCls}
                value={campos.description}
                onChange={(e) => cambiar("description", e.target.value)}
                aria-describedby="blog-desc-cuenta"
              />
              <p
                id="blog-desc-cuenta"
                className={`mt-1 text-xs ${descripcionOk ? "text-[var(--positive)]" : "text-[var(--danger)]"}`}
              >
                {t("blog.editor.descriptionCount", { n: cuentaDescripcion })}
              </p>
            </div>
            <div>
              <label htmlFor="blog-intro" className={labelCls}>
                {t("blog.editor.intro")}
              </label>
              <textarea
                id="blog-intro"
                rows={4}
                className={inputCls}
                value={campos.intro}
                onChange={(e) => cambiar("intro", e.target.value)}
              />
            </div>
            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                <label htmlFor="blog-cuerpo" className="block text-sm font-medium">
                  {t("blog.editor.body")}
                </label>
                <div>
                  <input
                    ref={archivo}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                    className="sr-only"
                    tabIndex={-1}
                    onChange={alSubirImagen}
                  />
                  <button
                    type="button"
                    className="btn-secondary !px-3 !py-1.5 !text-sm disabled:opacity-60"
                    disabled={subiendo}
                    onClick={() =>
                      slugOk
                        ? archivo.current?.click()
                        : aviso(t("blog.editor.uploadNeedSlug"), true)
                    }
                  >
                    {subiendo ? t("blog.editor.uploading") : t("blog.editor.uploadImage")}
                  </button>
                </div>
              </div>
              <textarea
                id="blog-cuerpo"
                ref={cuerpo}
                rows={30}
                spellCheck
                className={`${inputCls} ${mono}`}
                value={campos.body}
                onChange={(e) => cambiar("body", e.target.value)}
                aria-describedby="blog-cuerpo-ayuda"
              />
              <p id="blog-cuerpo-ayuda" className="text-muted mt-1 text-xs">
                {t("blog.editor.bodyHelp")}
              </p>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-4">
        <section className="border-rule bg-paper-alt rounded-2xl border p-5">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary disabled:opacity-60"
              disabled={pendiente}
              onClick={alGuardar}
            >
              {pendiente
                ? t("blog.editor.saving")
                : estado
                  ? t("blog.editor.saveChanges")
                  : t("blog.editor.save")}
            </button>
            {post.id ? (
              <Link
                href={`/admin/blog/${post.id}/vista`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                {t("blog.editor.preview")}
              </Link>
            ) : (
              <span className="text-muted self-center text-xs">
                {t("blog.editor.previewNeedsSave")}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {estado === "publicado" || estado === "programado" ? (
              <button
                type="button"
                className="btn-secondary disabled:opacity-60"
                disabled={pendiente}
                onClick={alDespublicar}
              >
                {t("blog.editor.unpublish")}
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary disabled:opacity-60"
                disabled={pendiente || analisis.errores.length > 0}
                onClick={alPublicar}
              >
                {pendiente
                  ? t("blog.editor.publishing")
                  : futura
                    ? t("blog.editor.schedule")
                    : t("blog.editor.publish")}
              </button>
            )}
          </div>
          <p role="status" aria-live="polite" className="mt-3 min-h-5 text-sm">
            {mensaje ? (
              <span className={mensaje.error ? "text-[var(--danger)]" : "text-muted"}>
                {mensaje.texto}
              </span>
            ) : sucio ? (
              <span className="text-muted">{t("blog.editor.unsaved")}</span>
            ) : null}
          </p>
          {post.id ? (
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--rule)] pt-3 text-sm">
              <button
                type="button"
                className="text-muted hover:text-ink underline-offset-2 hover:underline"
                onClick={alDuplicar}
                disabled={pendiente}
              >
                {t("blog.editor.duplicate")}
              </button>
              <button
                type="button"
                className="text-muted underline-offset-2 hover:text-[var(--danger)] hover:underline"
                onClick={() => setBorrando((b) => !b)}
              >
                {t("blog.editor.delete")}
              </button>
            </div>
          ) : null}
          {borrando && post.id ? (
            <div className="mt-3 rounded-xl border border-[var(--danger)] p-3 text-sm">
              <p>
                {publicado
                  ? t("blog.editor.deleteConfirmSlug", { slug: post.slug })
                  : t("blog.editor.deleteConfirmDraft")}
              </p>
              {publicado ? (
                <input
                  className={`${inputCls} mt-2 font-mono`}
                  value={confirmarSlug}
                  onChange={(e) => setConfirmarSlug(e.target.value)}
                  aria-label={t("blog.editor.slug")}
                  spellCheck={false}
                />
              ) : null}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="btn-primary !bg-[var(--danger)] disabled:opacity-60"
                  disabled={pendiente || (publicado && confirmarSlug !== post.slug)}
                  onClick={alBorrar}
                >
                  {t("blog.editor.deleteConfirmButton")}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setBorrando(false)}>
                  {t("blog.editor.cancel")}
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {publicado ? (
          <section className="border-rule bg-paper-alt rounded-2xl border p-5">
            <h2 className="text-base font-semibold">
              {estado === "programado"
                ? t("blog.editor.scheduledTitle")
                : t("blog.editor.publishedTitle")}
            </h2>
            {estado === "programado" && fecha ? (
              <p className="text-muted mt-1 text-sm">
                {t("blog.editor.scheduledFor", {
                  fecha: fechaLarga(madridLocalAUtc(fecha)?.toISOString() ?? ""),
                })}
              </p>
            ) : null}
            <p className="text-muted mt-3 text-xs">{t("blog.editor.publicUrl")}</p>
            <p className="font-mono text-[13px] break-all">{urlPublica}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-secondary !px-3 !py-1.5 !text-sm"
                onClick={copiarUrl}
              >
                {copiada ? t("blog.editor.copied") : t("blog.editor.copyUrl")}
              </button>
              <a
                className="btn-secondary !px-3 !py-1.5 !text-sm"
                href={`https://search.google.com/search-console/inspect?resource_id=sc-domain:angel-fernandez.es&id=${encodeURIComponent(urlPublica)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("blog.editor.searchConsole")}
              </a>
            </div>
            <p className="text-muted mt-2 text-xs">{t("blog.editor.searchConsoleHelp")}</p>
          </section>
        ) : null}

        <section className="border-rule bg-paper-alt rounded-2xl border p-5" aria-live="polite">
          <h2 className="text-base font-semibold">{t("blog.editor.checkerTitle")}</h2>
          <p className="text-muted mt-1 text-sm">
            {t("blog.editor.words", { n: analisis.palabras })} ·{" "}
            {t("blog.editor.minutes", { n: analisis.minutos })} ({idioma.toUpperCase()})
          </p>
          {analisis.errores.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--positive)]">{t("blog.editor.checkerOk")}</p>
          ) : (
            <div className="mt-3">
              <p className="text-sm font-medium text-[var(--danger)]">
                {t("blog.editor.checkerErrors")} ({analisis.errores.length})
              </p>
              {lista(analisis.errores, "danger")}
            </div>
          )}
          {analisis.avisos.length > 0 ? (
            <div className="mt-4">
              <p className="text-sm font-medium text-[var(--warn)]">
                {t("blog.editor.checkerWarnings")} ({analisis.avisos.length})
              </p>
              {lista(analisis.avisos, "warn")}
            </div>
          ) : null}
        </section>

        {post.id ? (
          <section className="border-rule bg-paper-alt rounded-2xl border p-5">
            <h2 className="text-base font-semibold">{t("blog.editor.historyTitle")}</h2>
            {versiones.length === 0 ? (
              <p className="text-muted mt-2 text-sm">{t("blog.editor.historyEmpty")}</p>
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
                      {t("blog.editor.restore")}
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
