import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { filaAProyecto, obtenerProyectoAdmin } from "@/lib/proyectos-admin";
import { PortfolioVista } from "@/components/portal/portfolio-vista";

type Params = Promise<{ id: string }>;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("portfolio.preview.title"), robots: { index: false, follow: false } };
}

export default async function VistaPreviaProyectoPage({ params }: { params: Params }) {
  await requireAdmin();
  const fila = await obtenerProyectoAdmin((await params).id);
  if (!fila) notFound();
  const { t } = await getI18n();

  return (
    <>
      <Link
        href={`/admin/portfolio/${fila.id}`}
        className="text-muted hover:text-ink mb-3 inline-block text-sm"
      >
        {t("portfolio.preview.edit")}
      </Link>
      <PortfolioVista proyecto={filaAProyecto(fila)} />
    </>
  );
}
