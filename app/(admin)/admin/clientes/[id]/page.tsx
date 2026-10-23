import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/portal/validate";
import { listarBolsas, listarProyectos } from "@/lib/portal/queries";
import type { Empresa } from "@/lib/portal/types";
import { EmptyState, EstadoProyectoBadge, PageHeader, Panel, ProgressBar } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("admin.clientsTitle") };
}

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { t, fecha } = await getI18n();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("empresas").select("*").eq("id", id).maybeSingle();
  const empresa = data as Empresa | null;
  if (!empresa) notFound();

  const [{ data: usuarios }, proyectos, bolsas] = await Promise.all([
    supabase.from("usuarios").select("id, nombre, email").eq("empresa_id", id).order("nombre"),
    listarProyectos(),
    listarBolsas(),
  ]);
  const suyos = proyectos.filter((p) => p.empresa_id === id);
  const bolsa = bolsas.find((b) => b.empresa_id === id);

  return (
    <>
      <p className="mb-4 text-sm">
        <Link href="/admin/clientes" className="text-muted underline-offset-4 hover:text-ink hover:underline">
          {t("admin.back")}
        </Link>
      </p>
      <PageHeader title={empresa.nombre} intro={t("admin.customerSince", { date: fecha(empresa.created_at) })} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("admin.people")}>
          {(usuarios ?? []).length === 0 ? (
            <EmptyState>{t("admin.nobody")}</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--rule)]">
              {(usuarios ?? []).map((u) => (
                <li key={u.id} className="py-2.5 first:pt-0 last:pb-0">
                  <p className="font-medium">{u.nombre}</p>
                  <p className="text-sm text-muted">{u.email}</p>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={t("admin.hourBank")}
          action={
            <Link href="/admin/horas" className="text-sm underline underline-offset-4 hover:text-accent">
              {t("admin.manage")}
            </Link>
          }
        >
          {bolsa ? (
            <>
              <p className="text-2xl font-semibold">
                {Math.max(0, bolsa.horas_contratadas - bolsa.horas_consumidas)}
                <span className="ml-1 text-sm font-normal text-muted">{t("admin.availOf", { total: bolsa.horas_contratadas })}</span>
              </p>
              <div className="mt-3">
                <ProgressBar value={bolsa.horas_consumidas} max={bolsa.horas_contratadas} label={t("home.consumedHours")} />
              </div>
            </>
          ) : (
            <EmptyState>{t("admin.noBank")}</EmptyState>
          )}
        </Panel>

        <Panel title={t("admin.projectsTitle")} className="lg:col-span-2">
          {suyos.length === 0 ? (
            <EmptyState>{t("admin.noCompanyProjects")}</EmptyState>
          ) : (
            <ul className="divide-y divide-[var(--rule)]">
              {suyos.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                  <Link href={`/admin/proyectos/${p.id}`} className="font-medium underline-offset-4 hover:text-accent hover:underline">
                    {p.titulo}
                  </Link>
                  <EstadoProyectoBadge estado={p.estado} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
