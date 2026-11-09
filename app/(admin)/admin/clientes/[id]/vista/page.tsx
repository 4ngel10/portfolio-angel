import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import {
  cargarIncidencias,
  listarBolsas,
  listarHitos,
  listarLineasPresupuesto,
  listarMovimientos,
  listarPresupuestos,
  listarProyectos,
} from "@/lib/portal/queries";
import { isUuid, oneOf } from "@/lib/portal/validate";
import type { Empresa } from "@/lib/portal/types";
import { IncidenciasLista } from "@/components/portal/listas";
import { PageHeader, Panel } from "@/components/portal/ui";
import {
  BolsaDeHoras,
  ListaPresupuestos,
  PanelProyectos,
  PanelTuTurno,
} from "@/components/portal/vistas-cliente";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.viewAsClient") };
}

const SECCIONES = ["proyectos", "incidencias", "horas", "presupuestos"] as const;

/**
 * Lo que ve el cliente en su portal, para una empresa. Solo lectura y sin cambiar de sesión: son
 * las mismas consultas del admin filtradas por empresa_id, pintadas con los mismos componentes
 * que las páginas del portal (`vistas-cliente.tsx`), en el mismo orden y al mismo ancho.
 */
export default async function VistaClientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ seccion?: string }>;
}) {
  const perfil = await requireAdmin();
  const { t } = await getI18n();
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const seccion = oneOf((await searchParams).seccion, SECCIONES) ?? "proyectos";

  const supabase = await createClient();
  const { data } = await supabase.from("empresas").select("*").eq("id", id).maybeSingle();
  const empresa = data as Empresa | null;
  if (!empresa) notFound();

  // Las consultas son las del admin: se filtran por empresa aquí. Solo se piden las de la sección.
  const proyectos = (await listarProyectos()).filter((p) => p.empresa_id === id);
  const ids = new Set(proyectos.map((p) => p.id));

  let contenido: React.ReactNode;
  if (seccion === "proyectos") {
    const hitos = (await listarHitos()).filter((h) => ids.has(h.proyecto_id));
    contenido = (
      <div className="grid gap-6">
        <PanelTuTurno proyectos={proyectos} hitos={hitos} enlaces={false} />
        <PanelProyectos proyectos={proyectos} hitos={hitos} enlaces={false} />
      </div>
    );
  } else if (seccion === "incidencias") {
    const inc = await cargarIncidencias();
    const incidencias = inc.incidencias.filter((i) => i.empresa_id === id);
    const mensajes = inc.mensajes.filter((m) => incidencias.some((i) => i.id === m.incidencia_id));
    contenido = (
      <Panel title={t("incidentsPage.yours")}>
        <IncidenciasLista
          incidencias={incidencias}
          mensajes={mensajes}
          autores={inc.autores}
          proyectos={Object.fromEntries(proyectos.map((p) => [p.id, p.titulo]))}
          perfilId={perfil.id}
          soloLectura
          rutaProyecto="/admin/proyectos"
        />
      </Panel>
    );
  } else if (seccion === "horas") {
    const [bolsas, movimientos] = await Promise.all([
      listarBolsas(),
      listarMovimientos({ empresaId: id }),
    ]);
    contenido = (
      <BolsaDeHoras
        bolsa={bolsas.find((b) => b.empresa_id === id)}
        movimientos={movimientos}
        proyectos={proyectos}
      />
    );
  } else {
    const [todos, lineas] = await Promise.all([listarPresupuestos(), listarLineasPresupuesto()]);
    // El cliente nunca ve los borradores.
    const presupuestos = todos.filter((p) => p.empresa_id === id && p.estado !== "borrador");
    contenido = <ListaPresupuestos presupuestos={presupuestos} lineas={lineas} enlaces={false} />;
  }

  const pestanas = [
    { clave: "proyectos", label: t("nav.projects") },
    { clave: "incidencias", label: t("nav.incidents") },
    { clave: "horas", label: t("nav.hourBank") },
    { clave: "presupuestos", label: t("nav.quotes") },
  ] as const;
  const titulo = {
    proyectos: empresa.nombre,
    incidencias: t("incidentsPage.title"),
    horas: t("hoursPage.title"),
    presupuestos: t("quotes.clientTitle"),
  }[seccion];
  const intro = {
    proyectos: t("home.intro"),
    incidencias: t("incidentsPage.intro"),
    horas: t("hoursPage.intro"),
    presupuestos: t("quotes.clientIntro"),
  }[seccion];

  return (
    <div data-vista>
      {/* Banda fija bajo la cabecera del admin: deja claro que es la vista del cliente y cómo volver. */}
      <div
        role="status"
        className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-b-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-white md:px-6 dark:text-[#0a0f1c]"
      >
        <span>
          {t("admin.viewingBanner", { company: empresa.nombre })}
          <span className="ml-2 font-normal opacity-90">{t("admin.viewingReadOnly")}</span>
        </span>
        <Link
          href={`/admin/clientes/${id}`}
          className="rounded-lg bg-white/15 px-3.5 py-1.5 font-semibold underline-offset-4 transition-colors hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t("admin.backToProfile")}
        </Link>
      </div>

      <div className="mx-auto max-w-[1080px] pt-6 md:pt-8">
        <nav
          aria-label={t("common.mainNav")}
          className="border-rule mb-8 flex gap-1 overflow-x-auto border-b whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {pestanas.map((p) => (
            <Link
              key={p.clave}
              href={`/admin/clientes/${id}/vista?seccion=${p.clave}`}
              aria-current={p.clave === seccion ? "page" : undefined}
              className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-offset-[-2px] ${
                p.clave === seccion
                  ? "text-ink border-[var(--accent)]"
                  : "text-muted hover:text-ink border-transparent"
              }`}
            >
              {p.label}
            </Link>
          ))}
        </nav>
        <PageHeader title={titulo} intro={intro} />
        {contenido}
      </div>
    </div>
  );
}
