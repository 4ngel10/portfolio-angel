import Link from "next/link";
import { signOut } from "@/lib/portal/actions";
import { getI18n } from "@/lib/portal/i18n";
import type { Perfil } from "@/lib/portal/types";
import { I18nBoundary } from "./i18n-boundary";
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
        { href: "/admin/horas", label: t("nav.hours") },
      ]
    : [
        { href: "/portal", label: t("nav.projects"), exact: true },
        { href: "/portal/incidencias", label: t("nav.incidents") },
        { href: "/portal/horas", label: t("nav.hourBank") },
      ];

  return (
    <I18nBoundary>
      <div className="min-h-dvh bg-paper text-ink">
        <header className="border-b border-rule bg-paper">
          <div
            className={`mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 md:px-8 ${admin ? "max-w-[1280px]" : "max-w-[1080px]"}`}
          >
            <Link href={admin ? "/admin" : "/portal"} className="font-semibold tracking-tight">
              Ángel Fernández
              <span className="ml-2 font-normal text-muted">
                {admin ? t("common.areaAdmin") : t("common.areaClients")}
              </span>
            </Link>
            <NavLinks items={items} label={t("common.mainNav")} />
            <div className="ml-auto flex items-center gap-3 text-sm">
              <span className="hidden max-w-[22ch] truncate text-muted lg:inline">{perfil.email}</span>
              <Prefs />
              <form action={signOut}>
                <button type="submit" className="btn-secondary !px-3.5 !py-2 !text-sm">
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
