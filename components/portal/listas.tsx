import Link from "next/link";
import {
  cambiarEstadoIncidencia,
  cambiarHito,
  eliminarArchivo,
  eliminarHito,
  enviarMensaje,
} from "@/lib/portal/actions";
import { getI18n } from "@/lib/portal/i18n";
import type { Archivo, Hito, Incidencia, MensajeIncidencia } from "@/lib/portal/types";
import { ActionForm } from "./action-form";
import { ConfirmSubmit } from "./confirm-submit";
import { inputCls } from "./styles";
import {
  CheckIcon,
  EmptyState,
  EstadoIncidenciaBadge,
  PelotaBadge,
  PrioridadBadge,
  fmtTamanio,
} from "./ui";

const botonMini =
  "rounded-lg border border-rule px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-[var(--fg)] hover:text-ink active:scale-[0.97]";

/** Hitos de un proyecto en orden. En vista admin se pueden completar, reasignar y borrar. */
export async function HitosLista({ hitos, admin = false }: { hitos: Hito[]; admin?: boolean }) {
  const { t, fecha } = await getI18n();
  if (hitos.length === 0) return <EmptyState>{t("lists.noMilestones")}</EmptyState>;
  return (
    <ol className="grid gap-2">
      {hitos.map((h) => (
        <li
          key={h.id}
          className={`flex gap-3 rounded-xl border border-rule bg-paper p-4 transition-colors ${h.completado ? "opacity-70" : ""}`}
        >
          <CheckIcon done={h.completado} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className={`font-medium ${h.completado ? "line-through decoration-muted/60" : ""}`}>
                {h.titulo}
                <span className="sr-only">{h.completado ? t("lists.completedSr") : t("lists.pendingSr")}</span>
              </p>
              {h.completado ? null : <PelotaBadge pelota={h.pelota_en} vista={admin ? "admin" : "cliente"} />}
            </div>
            {h.descripcion ? <p className="mt-1 text-sm text-muted">{h.descripcion}</p> : null}
            {h.fecha_objetivo && !h.completado ? (
              <p className="mt-1 text-xs text-muted">{t("lists.target", { date: fecha(h.fecha_objetivo) })}</p>
            ) : null}

            {admin ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <form action={cambiarHito}>
                  <input type="hidden" name="id" value={h.id} />
                  <input type="hidden" name="completado" value={String(!h.completado)} />
                  <button type="submit" className={botonMini}>
                    {h.completado ? t("lists.reopen") : t("lists.markDone")}
                  </button>
                </form>
                {h.completado ? null : (
                  <form action={cambiarHito}>
                    <input type="hidden" name="id" value={h.id} />
                    <input type="hidden" name="pelota_en" value={h.pelota_en === "cliente" ? "equipo" : "cliente"} />
                    <button type="submit" className={botonMini}>
                      {h.pelota_en === "cliente" ? t("lists.passToTeam") : t("lists.passToClient")}
                    </button>
                  </form>
                )}
                <form action={eliminarHito}>
                  <input type="hidden" name="id" value={h.id} />
                  <ConfirmSubmit mensaje={t("lists.deleteMilestone", { title: h.titulo })} className={botonMini}>
                    {t("common.delete")}
                  </ConfirmSubmit>
                </form>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

export async function ArchivosLista({ archivos, admin = false }: { archivos: Archivo[]; admin?: boolean }) {
  const { t, fecha } = await getI18n();
  if (archivos.length === 0) return <EmptyState>{t("lists.noFiles")}</EmptyState>;
  return (
    <ul className="grid gap-2">
      {archivos.map((a) => (
        <li key={a.id} className="flex items-center gap-3 rounded-xl border border-rule bg-paper px-4 py-3">
          <div className="min-w-0 flex-1">
            <a
              href={`/api/storage/download?id=${a.id}`}
              className="block truncate font-medium underline-offset-4 hover:text-accent hover:underline"
            >
              {a.nombre}
            </a>
            <p className="text-xs text-muted">
              {fmtTamanio(a.tamanio_bytes)} · {fecha(a.created_at)}
            </p>
          </div>
          {admin ? (
            <form action={eliminarArchivo}>
              <input type="hidden" name="id" value={a.id} />
              <ConfirmSubmit
                mensaje={t("lists.deleteFile", { name: a.nombre })}
                className={botonMini}
                label={t("lists.deleteFileLabel", { name: a.nombre })}
              >
                {t("common.delete")}
              </ConfirmSubmit>
            </form>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

type IncidenciasProps = {
  incidencias: Incidencia[];
  mensajes: MensajeIncidencia[];
  /** id de usuario -> nombre, para firmar los mensajes. */
  autores: Record<string, string>;
  /** id de proyecto -> título, para enlazar cada incidencia con su proyecto. */
  proyectos: Record<string, string>;
  perfilId: string;
  admin?: boolean;
  /** Ocultar el nombre del proyecto cuando ya se está dentro de él. */
  sinProyecto?: boolean;
  /** Prefijo de enlace al proyecto: /portal/proyecto o /admin/proyectos. */
  rutaProyecto: string;
};

export async function IncidenciasLista({
  incidencias,
  mensajes,
  autores,
  proyectos,
  perfilId,
  admin = false,
  sinProyecto = false,
  rutaProyecto,
}: IncidenciasProps) {
  const { t, fecha } = await getI18n();
  if (incidencias.length === 0) return <EmptyState>{t("lists.noIncidents")}</EmptyState>;

  return (
    <ul className="grid gap-3">
      {incidencias.map((i) => {
        const hilo = mensajes.filter((m) => m.incidencia_id === i.id);
        return (
          <li key={i.id} className="rounded-xl border border-rule bg-paper p-4 md:p-5">
            <div className="flex flex-wrap items-center gap-2">
              <EstadoIncidenciaBadge estado={i.estado} />
              <PrioridadBadge prioridad={i.prioridad} />
              <span className="text-xs text-muted">{fecha(i.created_at)}</span>
            </div>
            <h3 className="mt-2 font-semibold">{i.titulo}</h3>
            {sinProyecto ? null : (
              <p className="text-xs text-muted">
                <Link href={`${rutaProyecto}/${i.proyecto_id}`} className="underline-offset-4 hover:text-accent hover:underline">
                  {proyectos[i.proyecto_id] ?? t("common.projectFallback")}
                </Link>
              </p>
            )}
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{i.descripcion}</p>

            {admin ? (
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t("lists.changeState")}>
                {(["abierta", "en_progreso", "resuelta"] as const).map((e) =>
                  e === i.estado ? null : (
                    <form key={e} action={cambiarEstadoIncidencia}>
                      <input type="hidden" name="id" value={i.id} />
                      <input type="hidden" name="estado" value={e} />
                      <button type="submit" className={botonMini}>
                        {e === "abierta" ? t("lists.reopen") : e === "en_progreso" ? t("lists.setInProgress") : t("lists.markResolved")}
                      </button>
                    </form>
                  ),
                )}
              </div>
            ) : null}

            <details className="group mt-4 border-t border-rule pt-3">
              <summary className="cursor-pointer text-sm font-medium text-muted transition-colors hover:text-ink">
                {hilo.length === 0 ? t("lists.reply") : t("lists.thread", { n: hilo.length })}
              </summary>
              <ul className="mt-3 grid gap-2">
                {hilo.map((m) => (
                  <li
                    key={m.id}
                    className={`rounded-xl px-3.5 py-2.5 text-sm ${m.autor_id === perfilId ? "bg-chip" : "border border-rule"}`}
                  >
                    <p className="text-xs text-muted">
                      {m.autor_id === perfilId ? t("lists.you") : (m.autor_id && autores[m.autor_id]) || t("lists.team")} ·{" "}
                      {fecha(m.created_at)}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap">{m.contenido}</p>
                  </li>
                ))}
              </ul>
              <ActionForm action={enviarMensaje} submitLabel={t("lists.send")} pendingLabel={t("lists.sending")} secondary className="mt-3">
                <input type="hidden" name="incidencia_id" value={i.id} />
                <label htmlFor={`msg-${i.id}`} className="sr-only">
                  {t("lists.message")}
                </label>
                <textarea id={`msg-${i.id}`} name="contenido" required rows={3} maxLength={4000} className={inputCls} placeholder={t("lists.messagePlaceholder")} />
              </ActionForm>
            </details>
          </li>
        );
      })}
    </ul>
  );
}
