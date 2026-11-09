import Link from "next/link";
import { signOut } from "@/lib/portal/actions";
import { getI18n } from "@/lib/portal/i18n";
import type { Perfil } from "@/lib/portal/types";
import { I18nBoundary } from "./i18n-boundary";
import { MenuNuevo } from "./menu-nuevo";
import { NavLinks } from "./nav-links";
import { Prefs } from "./prefs";

/** Marco común de la zona privada: cabecera con navegación, idioma, tema, usuario y salida. */
export async function Shell({
  perfil,
  vista,
  children,
}: {
  perfil: Perfil;
  vista: "cliente" | "admin";
  children: React.ReactNode;
}) {
  const { t } = await getI18n();
  const admin = vista === "admin";

  const items = admin
    ? [
        { href: "/admin", label: t("nav.overview"), exact: true },
        { href: "/admin/clientes", label: t("nav.clients") },
        { href: "/admin/proyectos", label: t("nav.projects") },
        { href: "/admin/incidencias", label: t("nav.incidents") },
        { href: "/admin/horas", label: t("nav.hours") },
        { href: "/admin/presupuestos", label: t("nav.quotes") },
        { href: "/admin/finanzas", label: t("nav.finance") },
      ]
    : [
        { href: "/portal", label: t("nav.projects"), exact: true },
        { href: "/portal/incidencias", label: t("nav.incidents") },
        { href: "/portal/horas", label: t("nav.hourBank") },
        { href: "/portal/presupuestos", label: t("nav.quotes") },
      ];

  return (
    <I18nBoundary>
      <div className="bg-paper text-ink min-h-dvh">
        <header className="border-rule bg-paper border-b">
          <div
            className={`mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-8 ${admin ? "max-w-[1280px]" : "max-w-[1080px]"}`}
          >
            <Link href={admin ? "/admin" : "/portal"} className="font-semibold tracking-tight">
              Ángel Fernández
              <span className="text-muted ml-2 hidden font-normal sm:inline">
                {admin ? t("common.areaAdmin") : t("common.areaClients")}
              </span>
            </Link>
            {/* Por debajo de lg la navegación baja a su propia fila, completa; a partir de lg
                comparte fila con la marca y las preferencias. */}
            <div className="order-last w-full lg:order-none lg:w-auto">
              <NavLinks items={items} label={t("common.mainNav")} />
            </div>
            <div className="ml-auto flex items-center gap-3 text-sm whitespace-nowrap">
              {admin ? (
                <>
                  <MenuNuevo
                    etiqueta={t("nav.new")}
                    items={[
                      { href: "/admin/presupuestos/nuevo", label: t("nav.newQuote") },
                      { href: "/admin/clientes?nuevo=1", label: t("nav.newClient") },
                      { href: "/admin/proyectos#nuevo", label: t("nav.newProject") },
                      { href: "/admin/finanzas/cobros#nuevo", label: t("nav.newCharge") },
                      { href: "/admin/finanzas/gastos#nuevo", label: t("nav.newExpense") },
                    ]}
                  />
                  <Link
                    href="/"
                    className="text-muted hover:text-ink inline-flex items-center gap-1.5 rounded-lg px-1 py-1 text-sm transition-colors"
                    aria-label={t("nav.viewSite")}
                  >
                    <span className="hidden sm:inline">{t("nav.viewSite")}</span>
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Link>
                </>
              ) : null}
              <Prefs />
              <form action={signOut}>
                <button
                  type="submit"
                  title={perfil.email}
                  className="btn-secondary !px-3.5 !py-2 !text-sm"
                >
                  {t("common.signOut")}
                </button>
              </form>
            </div>
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className={`mx-auto px-4 py-8 md:px-8 md:py-12 ${admin ? "max-w-[1280px]" : "max-w-[1080px]"}`}
        >
          {children}
        </main>
      </div>
    </I18nBoundary>
  );
}
