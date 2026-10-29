import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireCliente } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { listarLineasPresupuesto } from "@/lib/portal/queries";
import { isUuid } from "@/lib/portal/validate";
import type { Presupuesto } from "@/lib/portal/types";
import { FirmarPresupuesto } from "@/components/portal/firmar-presupuesto";
import { PresupuestoDocumento } from "@/components/portal/presupuesto-documento";
import { PageHeader } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("quotes.clientTitle") };
}

export default async function PresupuestoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireCliente();
  const { t } = await getI18n();
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("presupuestos").select("*").eq("id", id).maybeSingle();
  const presupuesto = data as Presupuesto | null;
  if (!presupuesto) notFound(); // RLS oculta los borradores y los de otra empresa

  const lineas = await listarLineasPresupuesto([id]);

  return (
    <>
      <p className="mb-3 text-sm">
        <Link
          href="/portal/presupuestos"
          className="text-muted hover:text-ink underline-offset-4 hover:underline"
        >
          {t("quotes.backToList")}
        </Link>
      </p>
      <PageHeader title={t("quotes.clientTitle")} />
      <div className="grid gap-6">
        <PresupuestoDocumento
          presupuesto={presupuesto}
          lineas={lineas}
          pdfHref={`/portal/presupuestos/${id}/pdf`}
        />
        {presupuesto.estado === "enviado" ? <FirmarPresupuesto id={id} /> : null}
      </div>
    </>
  );
}
