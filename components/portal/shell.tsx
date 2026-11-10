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
  const ancho = admin ? "max-w-[1280px]" : "max-w-[1080px]";

  const items = admin
    ? [
        { href: "/admin", label: t("nav.overview"), exact: true },
        { href: "/admin/clientes", label: t("nav.clients") },
        { href: "/admin/proyectos", label: t("nav.projects") },
        { href: "/admin/incidencias", label: t("nav.incidents") },
        { href: "/admin/horas", label: t("nav.hours") },
        { href: "/admin/presupuestos", label: t("nav.quotes") },
        { href: "/admin/finanzas", label: t("nav.finance") },
        { href: "/admin/blog", label: t("nav.blog") },
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
        <header className="bg-paper">
          {/* Fila 1: marca a la izquierda; a la derecha, atajos, preferencias y salida. Por debajo
              de unos 400px no caben en una línea y las acciones bajan sin romper la marca. */}
          <div
            className={`mx-auto flex flex-wrap items-center gap-x-4 gap-y-2 px-4 pt-3 pb-1 md:px-8 ${ancho}`}
          >
            <Link
              href={admin ? "/admin" : "/portal"}
              className="shrink-0 font-semibold tracking-tight"
            >
              Ángel Fernández
              <span className="text-muted ml-2 hidden font-normal sm:inline">
                {admin ? t("common.areaAdmin") : t("common.areaClients")}
              </span>
            </Link>
            <div className="ml-auto flex items-center gap-2 text-sm whitespace-nowrap sm:gap-3">
              {admin ? (
                <MenuNuevo
                  etiqueta={t("nav.new")}
                  items={[
                    { href: "/admin/presupuestos/nuevo", label: t("nav.newQuote") },
                    { href: "/admin/clientes?nuevo=1", label: t("nav.newClient") },
                    { href: "/admin/proyectos#nuevo", label: t("nav.newProject") },
                    { href: "/admin/finanzas/cobros#nuevo", label: t("nav.newCharge") },
                    { href: "/admin/finanzas/gastos#nuevo", label: t("nav.newExpense") },
                    { href: "/admin/blog/nuevo", label: t("nav.newPost") },
                  ]}
                />
              ) : null}
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
              <Prefs />
              <form action={signOut}>
                <button
                  type="submit"
                  title={perfil.email}
                  aria-label={t("common.signOut")}
                  className="btn-secondary !px-3 !py-2 !text-sm sm:!px-3.5"
                >
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
                    className="sm:hidden"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span className="hidden sm:inline">{t("common.signOut")}</span>
                </button>
              </form>
            </div>
          </div>
          {/* Fila 2: secciones como pestañas. El borde cruza todo el ancho; en pantallas estrechas
              la fila hace scroll horizontal y nunca pasa a dos líneas. */}
          <div className="border-rule border-b">
            <div className={`mx-auto px-4 md:px-8 ${ancho}`}>
              <NavLinks items={items} label={t("common.mainNav")} />
            </div>
          </div>
        </header>
        <main
          id="main"
          tabIndex={-1}
          className={`mx-auto px-4 py-8 has-[[data-vista]]:pt-0 md:px-8 md:py-12 md:has-[[data-vista]]:pt-0 ${ancho}`}
        >
          {children}
        </main>
      </div>
    </I18nBoundary>
  );
}
