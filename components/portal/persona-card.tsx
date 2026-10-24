import { alternarUsuario, eliminarUsuario, guardarUsuario } from "@/lib/portal/actions";
import type { PortalT } from "@/lib/portal/translate";
import { ActionForm } from "./action-form";
import { ConfirmSubmit } from "./confirm-submit";
import { inputCls, labelCls } from "./styles";

export type PersonaInfo = {
  id: string;
  nombre: string;
  email: string;
  empresa_id: string | null;
  desactivada: boolean;
  alta: string | null;
  ultimoAcceso: string | null;
  contrasena: "propia" | "provisional" | "pendiente";
};

/** Ficha de una persona de la empresa: datos, edición, contraseña, desactivar y eliminar. */
export function PersonaCard({
  persona: p,
  empresas,
  t,
  fecha,
}: {
  persona: PersonaInfo;
  empresas: { id: string; nombre: string }[];
  t: PortalT;
  fecha: (iso: string | null | undefined) => string;
}) {
  const datos = [
    [t("admin.registered"), fecha(p.alta) || "-"],
    [t("admin.lastAccess"), p.ultimoAcceso ? fecha(p.ultimoAcceso) : t("admin.neverAccessed")],
    [t("admin.passwordState"), t(`admin.password_${p.contrasena}`)],
  ] as const;

  return (
    <details className="border-rule group rounded-xl border">
      <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 p-3 md:px-4">
        <span className="min-w-0 flex-1">
          <span className="block font-medium">{p.nombre}</span>
          <span className="text-muted block truncate text-sm">{p.email}</span>
        </span>
        <span
          className={`border-rule rounded-full border px-2.5 py-0.5 text-xs ${p.desactivada ? "text-[var(--accent)]" : "text-muted"}`}
        >
          {p.desactivada ? t("admin.disabled") : t("admin.active")}
        </span>
        <span className="text-sm underline underline-offset-4">{t("admin.manage")}</span>
      </summary>

      <div className="border-rule border-t p-3 md:p-4">
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
          {datos.map(([k, v]) => (
            <div key={k}>
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="border-rule mt-4 border-t pt-4">
          <ActionForm
            action={guardarUsuario}
            submitLabel={t("admin.save")}
            pendingLabel={t("admin.saving")}
          >
            <input type="hidden" name="id" value={p.id} />
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label htmlFor={`n-${p.id}`} className={labelCls}>
                  {t("common.name")}
                </label>
                <input
                  id={`n-${p.id}`}
                  name="nombre"
                  required
                  maxLength={80}
                  defaultValue={p.nombre}
                  autoComplete="off"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor={`e-${p.id}`} className={labelCls}>
                  {t("common.email")}
                </label>
                <input
                  id={`e-${p.id}`}
                  name="email"
                  type="email"
                  required
                  defaultValue={p.email}
                  autoComplete="off"
                  spellCheck={false}
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor={`c-${p.id}`} className={labelCls}>
                  {t("common.company")}
                </label>
                <select
                  id={`c-${p.id}`}
                  name="empresa_id"
                  required
                  defaultValue={p.empresa_id ?? ""}
                  className={inputCls}
                >
                  <option value="" disabled>
                    {t("common.chooseCompany")}
                  </option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor={`p-${p.id}`} className={labelCls}>
                  {t("admin.newPassword")}
                </label>
                <input
                  id={`p-${p.id}`}
                  name="password"
                  type="password"
                  minLength={8}
                  maxLength={72}
                  autoComplete="new-password"
                  aria-describedby={`ph-${p.id}`}
                  className={inputCls}
                />
                <p id={`ph-${p.id}`} className="text-muted mt-1.5 text-xs">
                  {t("admin.passwordHint")}
                </p>
              </div>
            </div>
          </ActionForm>
        </div>

        <div className="border-rule mt-5 flex flex-wrap gap-3 border-t pt-4">
          <form action={alternarUsuario}>
            <input type="hidden" name="id" value={p.id} />
            <input type="hidden" name="desactivar" value={p.desactivada ? "false" : "true"} />
            {p.desactivada ? (
              <button type="submit" className="btn-secondary !px-4 !py-2 !text-sm">
                {t("admin.enable")}
              </button>
            ) : (
              <ConfirmSubmit
                mensaje={t("admin.confirmDisable", { name: p.nombre })}
                className="btn-secondary !px-4 !py-2 !text-sm"
              >
                {t("admin.disable")}
              </ConfirmSubmit>
            )}
          </form>
          <form action={eliminarUsuario}>
            <input type="hidden" name="id" value={p.id} />
            <ConfirmSubmit
              mensaje={t("admin.confirmDelete", { name: p.nombre })}
              className="btn-secondary !px-4 !py-2 !text-sm !text-[var(--accent)]"
            >
              {t("admin.deleteUser")}
            </ConfirmSubmit>
          </form>
        </div>
      </div>
    </details>
  );
}
