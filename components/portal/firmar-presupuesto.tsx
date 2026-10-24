"use client";

import { firmarPresupuesto, rechazarPresupuesto } from "@/lib/portal/actions";
import { ActionForm } from "./action-form";
import { ConfirmSubmit } from "./confirm-submit";
import { usePT } from "./i18n-provider";
import { inputCls, labelCls } from "./styles";

/** Aceptar el presupuesto firmándolo con el nombre completo, o rechazarlo. */
export function FirmarPresupuesto({ id }: { id: string }) {
  const { t } = usePT();
  return (
    <section className="border-rule bg-paper-alt rounded-2xl border p-5 md:p-6">
      <h2 className="text-lg font-semibold tracking-tight">{t("quotes.signTitle")}</h2>
      <p className="text-muted mt-1 max-w-[60ch] text-sm">{t("quotes.signIntro")}</p>

      <ActionForm
        action={firmarPresupuesto}
        submitLabel={t("quotes.signAndAccept")}
        pendingLabel={t("admin.saving")}
        className="mt-4"
      >
        <input type="hidden" name="id" value={id} />
        <label htmlFor="firma" className={labelCls}>
          {t("quotes.signName")}
        </label>
        <input
          id="firma"
          name="firma"
          required
          minLength={3}
          maxLength={120}
          autoComplete="name"
          className={`${inputCls} sm:max-w-sm`}
        />
        <label className="mt-3 flex max-w-[60ch] items-start gap-2 text-sm">
          <input type="checkbox" name="acepto" required className="mt-1" />
          <span>{t("quotes.signConfirm")}</span>
        </label>
      </ActionForm>

      <form action={rechazarPresupuesto} className="border-rule mt-5 border-t pt-4">
        <input type="hidden" name="id" value={id} />
        <ConfirmSubmit
          mensaje={t("quotes.rejectConfirm")}
          className="btn-secondary !px-4 !py-2 !text-sm"
        >
          {t("quotes.reject")}
        </ConfirmSubmit>
      </form>
    </section>
  );
}
