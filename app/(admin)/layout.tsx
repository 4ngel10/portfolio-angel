import type { Metadata } from "next";
import { requireAdmin } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { Shell } from "@/components/portal/shell";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  const area = t("common.areaAdmin");
  return { title: { default: area, template: `%s | ${area}` }, robots: { index: false, follow: false } };
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const perfil = await requireAdmin();
  return (
    <Shell perfil={perfil} vista="admin">
      {children}
    </Shell>
  );
}
