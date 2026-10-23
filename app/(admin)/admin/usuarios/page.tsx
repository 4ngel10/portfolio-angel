import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { listarEmpresas } from "@/lib/portal/queries";
import { alternarUsuario, eliminarUsuario, guardarUsuario } from "@/lib/portal/actions";
import { ActionForm } from "@/components/portal/action-form";
import { ConfirmSubmit } from "@/components/portal/confirm-submit";
import { inputCls, labelCls } from "@/components/portal/styles";
import { EmptyState, PageHeader } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.usersTitle") };
}

export default async function UsuariosPage() {
  await requireAdmin();
  const { t } = await getI18n();
  const supabase = await createClient();
  const [empresas, { data: usuarios }, auth] = await Promise.all([
    listarEmpresas(),
    supabase
      .from("usuarios")
      .select("id, empresa_id, nombre, email")
      .eq("role", "cliente")
      .order("nombre"),
    createAdminClient().auth.admin.listUsers({ perPage: 1000 }),
  ]);

  const ahora = Date.now();
  const desactivados = new Set(
    (auth.data?.users ?? [])
      .filter((u) => u.banned_until && new Date(u.banned_until).getTime() > ahora)
      .map((u) => u.id),
  );
  const empresa = (id: string | null) => empresas.find((e) => e.id === id)?.nombre ?? "";

  return (
    <>
      <PageHeader title={t("admin.usersTitle")} intro={t("admin.usersIntro")} />
      {(usuarios ?? []).length === 0 ? (
        <EmptyState>{t("admin.noUsers")}</EmptyState>
      ) : (
        <ul className="grid gap-3">
          {(usuarios ?? []).map((u) => {
            const off = desactivados.has(u.id);
            return (
              <li key={u.id}>
                <details className="border-rule bg-paper-alt group rounded-2xl border">
                  <summary className="flex cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 p-4 md:px-6">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{u.nombre}</span>
                      <span className="text-muted block truncate text-sm">
                        {u.email}
                        {empresa(u.empresa_id) ? ` · ${empresa(u.empresa_id)}` : ""}
                      </span>
                    </span>
                    <span
                      className={`border-rule rounded-full border px-2.5 py-0.5 text-xs ${off ? "text-[var(--accent)]" : "text-muted"}`}
                    >
                      {off ? t("admin.disabled") : t("admin.active")}
                    </span>
                    <span className="text-sm underline underline-offset-4">{t("admin.edit")}</span>
                  </summary>

                  <div className="border-rule border-t p-4 md:p-6">
                    <ActionForm
                      action={guardarUsuario}
                      submitLabel={t("admin.save")}
                      pendingLabel={t("admin.saving")}
                    >
                      <input type="hidden" name="id" value={u.id} />
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label htmlFor={`n-${u.id}`} className={labelCls}>
                            {t("common.name")}
                          </label>
                          <input
                            id={`n-${u.id}`}
                            name="nombre"
                            required
                            maxLength={80}
                            defaultValue={u.nombre}
                            autoComplete="off"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label htmlFor={`e-${u.id}`} className={labelCls}>
                            {t("common.email")}
                          </label>
                          <input
                            id={`e-${u.id}`}
                            name="email"
                            type="email"
                            required
                            defaultValue={u.email}
                            autoComplete="off"
                            spellCheck={false}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label htmlFor={`c-${u.id}`} className={labelCls}>
                            {t("common.company")}
                          </label>
                          <select
                            id={`c-${u.id}`}
                            name="empresa_id"
                            required
                            defaultValue={u.empresa_id ?? ""}
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
                          <label htmlFor={`p-${u.id}`} className={labelCls}>
                            {t("admin.newPassword")}
                          </label>
                          <input
                            id={`p-${u.id}`}
                            name="password"
                            type="password"
                            minLength={8}
                            maxLength={72}
                            autoComplete="new-password"
                            aria-describedby={`ph-${u.id}`}
                            className={inputCls}
                          />
                          <p id={`ph-${u.id}`} className="text-muted mt-1.5 text-xs">
                            {t("admin.passwordHint")}
                          </p>
                        </div>
                      </div>
                    </ActionForm>

                    <div className="border-rule mt-5 flex flex-wrap gap-3 border-t pt-4">
                      <form action={alternarUsuario}>
                        <input type="hidden" name="id" value={u.id} />
                        <input type="hidden" name="desactivar" value={off ? "false" : "true"} />
                        {off ? (
                          <button type="submit" className="btn-secondary !px-4 !py-2 !text-sm">
                            {t("admin.enable")}
                          </button>
                        ) : (
                          <ConfirmSubmit
                            mensaje={t("admin.confirmDisable", { name: u.nombre })}
                            className="btn-secondary !px-4 !py-2 !text-sm"
                          >
                            {t("admin.disable")}
                          </ConfirmSubmit>
                        )}
                      </form>
                      <form action={eliminarUsuario}>
                        <input type="hidden" name="id" value={u.id} />
                        <ConfirmSubmit
                          mensaje={t("admin.confirmDelete", { name: u.nombre })}
                          className="btn-secondary !px-4 !py-2 !text-sm !text-[var(--accent)]"
                        >
                          {t("admin.deleteUser")}
                        </ConfirmSubmit>
                      </form>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
