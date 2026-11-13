import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { CAMPOS_PROYECTO_VACIOS, type EditorProyecto } from "@/lib/proyectos-editor";
import { portadasConocidas } from "@/lib/proyectos-portadas";
import { palabrasProhibidasDeEntorno } from "@/lib/proyectos-validate";
import { SITE_URL } from "@/lib/site";
import { PortfolioEditor } from "@/components/portal/portfolio-editor";
import { PageHeader } from "@/components/portal/ui";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("portfolio.editor.newTitle") };
}

const vacio = (): EditorProyecto["es"] => ({
  ...CAMPOS_PROYECTO_VACIOS,
  facts: CAMPOS_PROYECTO_VACIOS.facts.map((f) => ({ ...f })),
  results: [],
});

export default async function NuevoProyectoPage() {
  await requireAdmin();
  const { t } = await getI18n();
  return (
    <>
      <Link href="/admin/portfolio" className="text-muted hover:text-ink mb-3 inline-block text-sm">
        {t("portfolio.editor.back")}
      </Link>
      <PageHeader title={t("portfolio.editor.newTitle")} />
      <PortfolioEditor
        inicial={{
          id: null,
          slug: "",
          service: "web",
          tech: ["", "", "", ""],
          cover: "",
          tint: 10,
          url: "",
          image: "",
          imageDark: "",
          coverPosition: "",
          ogImage: "",
          enServicios: [],
          ejemplo: false,
          datosProvisionales: false,
          es: vacio(),
          en: vacio(),
        }}
        estado={null}
        fechaInicial=""
        conocidas={[]}
        versiones={[]}
        siteUrl={SITE_URL}
        prohibidas={palabrasProhibidasDeEntorno()}
        portadas={await portadasConocidas()}
      />
    </>
  );
}
