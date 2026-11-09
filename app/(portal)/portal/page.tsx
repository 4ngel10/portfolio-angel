import Link from "next/link";
import type { Metadata } from "next";
import { requireCliente } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import {
  cargarIncidencias,
  listarBolsas,
  listarHitos,
  listarProyectos,
} from "@/lib/portal/queries";
import { PageHeader, Panel, ProgressBar } from "@/components/portal/ui";
import { Aparece } from "@/components/portal/aparece";
import { PanelProyectos, PanelTuTurno } from "@/components/portal/vistas-cliente";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("nav.projects") };
}

export default async function PortalPage() {
  const perfil = await requireCliente();
  const { t, num } = await getI18n();
  const proyectos = await listarProyectos();
  const [hitos, bolsas, { incidencias }] = await Promise.all([
    listarHitos(proyectos.map((p) => p.id)),
    listarBolsas(),
    cargarIncidencias({ soloAbiertas: true }),
  ]);

  const bolsa = bolsas[0];
  const restantes = bolsa ? Math.max(0, bolsa.horas_contratadas - bolsa.horas_consumidas) : null;

  return (
    <>
      <PageHeader
        title={t("home.greeting", { name: perfil.nombre.split(" ")[0] })}
        intro={t("home.intro")}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid content-start gap-6">
          <Aparece>
            <PanelTuTurno proyectos={proyectos} hitos={hitos} enlaces />
          </Aparece>

          <Aparece retraso={0.05}>
            <PanelProyectos proyectos={proyectos} hitos={hitos} enlaces />
          </Aparece>
        </div>

        <aside className="grid content-start gap-6">
          <Aparece retraso={0.1}>
            <Panel title={t("home.hourBank")}>
              {bolsa && restantes !== null ? (
                <>
                  <p className="text-3xl font-semibold tracking-tight">
                    {restantes !== null ? num(restantes) : null}
                    <span className="text-muted ml-1 text-base font-normal">
                      {t("home.hoursAvailable")}
                    </span>
                  </p>
                  <div className="mt-3">
                    <ProgressBar
                      value={bolsa.horas_consumidas}
                      max={bolsa.horas_contratadas}
                      label={t("home.consumedHours")}
                    />
                  </div>
                  <p className="text-muted mt-2 text-xs">
                    {t("home.usedOfTotal", {
                      used: num(bolsa.horas_consumidas),
                      total: num(bolsa.horas_contratadas),
                    })}
                  </p>
                </>
              ) : (
                <p className="text-muted text-sm">{t("home.noBank")}</p>
              )}
              <Link
                href="/portal/horas"
                className="hover:text-accent mt-4 inline-block text-sm font-medium underline underline-offset-4"
              >
                {t("home.viewDetail")}
              </Link>
            </Panel>
          </Aparece>

          <Aparece retraso={0.15}>
            <Panel title={t("home.incidents")}>
              <p className="text-3xl font-semibold tracking-tight">
                {incidencias.length}
                <span className="text-muted ml-1 text-base font-normal">
                  {incidencias.length === 1 ? t("home.openOne") : t("home.openMany")}
                </span>
              </p>
              <Link
                href="/portal/incidencias"
                className="hover:text-accent mt-4 inline-block text-sm font-medium underline underline-offset-4"
              >
                {incidencias.length ? t("home.viewIncidents") : t("home.openIncident")}
              </Link>
            </Panel>
          </Aparece>
        </aside>
      </div>
    </>
  );
}
