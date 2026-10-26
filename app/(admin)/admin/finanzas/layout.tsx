import { getI18n } from "@/lib/portal/i18n";
import { NavLinks } from "@/components/portal/nav-links";

/** Subnavegación de Finanzas: Resumen, Cobros, Gastos, Suscripciones y Ajustes. */
export default async function FinanzasLayout({ children }: { children: React.ReactNode }) {
  const { t } = await getI18n();
  const items = [
    { href: "/admin/finanzas", label: t("finance.nav.summary"), exact: true },
    { href: "/admin/finanzas/cobros", label: t("finance.nav.collections") },
    { href: "/admin/finanzas/gastos", label: t("finance.nav.expenses") },
    { href: "/admin/finanzas/suscripciones", label: t("finance.nav.subscriptions") },
    { href: "/admin/finanzas/ajustes", label: t("finance.nav.settings") },
  ];
  return (
    <>
      <div className="mb-6">
        <NavLinks items={items} label={t("finance.nav.label")} />
      </div>
      {children}
    </>
  );
}
