"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";

/**
 * Enlace de la nav: los de ancla (#about) son <a> normales para que los coja el scroll suave
 * (lib/smooth-scroll.ts); los de ruta (/blog, /#about) van con Link de Next.
 */
export function NavLink(props: React.ComponentProps<"a"> & { href: string }) {
  return props.href.startsWith("#") ? <a {...props} /> : <Link {...props} />;
}

/**
 * Barra de navegación de todas las páginas. En la home los enlaces bajan a cada sección
 * y el scroll spy marca la que se ve. En el resto llevan a la sección de la home y se marca
 * el apartado al que pertenece la página (Servicios, Portfolio o Blog).
 */
export function Nav() {
  const { t, locale, setLocale } = useI18n();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  // Fuera de la home, las anclas apuntan a la home: /#about.
  const home = (hash: string) => (isHome ? hash : `/${hash}`);

  // Menú móvil: es un desplegable bajo la barra (patrón disclosure), no un modal que tape
  // la página, así que no atrapa el foco. Escape lo cierra y devuelve el foco al botón.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      menuButton.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const links = [
    { href: home("#about"), spy: "#about", label: t("nav.about") },
    { href: home("#services"), spy: "#services", section: "/servicios", label: t("nav.services") },
    {
      href: home("#portfolio"),
      spy: "#portfolio",
      section: "/proyectos",
      label: t("nav.portfolio"),
    },
    // Baja a la mención #blog de la home (desde ahí se entra al blog completo).
    { href: home("#blog"), spy: "#blog", section: "/blog", label: t("nav.blog") },
    { href: home("#contact"), spy: "#contact", label: t("nav.contact") },
  ];

  const isCurrent = (l: { spy: string; section?: string }) =>
    isHome ? active === l.spy : !!l.section && pathname.startsWith(l.section);

  // Scroll spy: marca en la nav la sección que ocupa la parte de arriba de la pantalla.
  useEffect(() => {
    if (!isHome) return;
    const ids = ["about", "services", "portfolio", "blog", "contact"];
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.35;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = `#${id}`;
      }
      // Al llegar al final, la última sección puede no alcanzar la línea: se marca igual.
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (atBottom && current) current = `#${ids[ids.length - 1]}`;
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isHome]);

  return (
    <nav
      aria-label={t("a11y.mainNav")}
      className="sticky top-0 z-50 flex h-[72px] items-center border-b backdrop-blur-md"
      style={{
        background: "color-mix(in oklab, var(--bg) 85%, transparent)",
        borderColor: "var(--rule)",
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 md:px-8">
        <NavLink href={isHome ? "#top" : "/"} className="text-[15px] font-semibold tracking-tight">
          Ángel Fernández<span style={{ color: "var(--accent)" }}>.</span>
        </NavLink>

        <div className="text-muted hidden items-center gap-9 text-sm font-medium md:flex">
          {links.map((l) => {
            const current = isCurrent(l);
            return (
              // El ::after invisible reserva el ancho en negrita: al activarse no empuja a los demás.
              <NavLink
                key={l.href}
                href={l.href}
                data-label={l.label}
                aria-current={current ? "location" : undefined}
                className={`inline-flex flex-col items-center transition-colors after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)] hover:text-[var(--fg)] ${current ? "font-semibold text-[var(--fg)]" : ""}`}
              >
                {l.label}
              </NavLink>
            );
          })}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setLocale(locale === "es" ? "en" : "es")}
            className="text-muted rounded-full border px-2.5 py-1.5 font-mono text-xs transition-colors hover:text-[var(--fg)]"
            style={{ borderColor: "var(--rule)" }}
            aria-label={t("a11y.toggleLanguage")}
          >
            <span className={locale === "es" ? "text-ink font-semibold" : ""}>ES</span>
            <span className="mx-1 opacity-40" aria-hidden>
              /
            </span>
            <span className={locale === "en" ? "text-ink font-semibold" : ""}>EN</span>
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={t("a11y.toggleTheme")}
            className="flex h-9 w-9 items-center justify-center rounded-xl border transition-colors"
            style={{ borderColor: "var(--rule)" }}
          >
            {theme === "dark" ? (
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
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
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
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            )}
          </button>

          {/* Solo escritorio. El hidden va en un envoltorio: en el enlace lo pisaba el display
              de .btn-primary y en móvil no cabía la nav. En móvil está MobileContactCta. */}
          {/* Ruta relativa: vale en localhost y en el dominio de producción. /login manda a cada
              rol a su zona (admin a /admin, cliente a /portal) y, sin sesión, pide el acceso. */}
          <span className="hidden lg:inline-flex">
            <Link href="/login" className="btn-secondary !px-4 !py-2.5 !text-sm">
              {t("nav.ctaClients")}
            </Link>
          </span>
          <span className="hidden md:inline-flex">
            <NavLink href={home("#contact")} className="btn-primary !px-4 !py-2.5 !text-sm">
              {t("nav.ctaContact")}
            </NavLink>
          </span>

          <button
            type="button"
            ref={menuButton}
            onClick={() => setOpen((v) => !v)}
            aria-label={t("a11y.toggleMenu")}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border md:hidden"
            style={{ borderColor: "var(--rule)" }}
          >
            {open ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden
              >
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div
          id="mobile-menu"
          className="absolute top-[72px] right-0 left-0 flex flex-col gap-4 border-b px-6 py-5 text-base font-medium md:hidden"
          style={{ background: "var(--bg)", borderColor: "var(--rule)" }}
        >
          {links.map((l) => (
            <NavLink
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              aria-current={isCurrent(l) ? "location" : undefined}
              className={isCurrent(l) ? "font-semibold" : ""}
            >
              {l.label}
            </NavLink>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="font-semibold">
            {t("nav.ctaClients")}
          </Link>
        </div>
      )}
    </nav>
  );
}
