import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireCliente, sinContrasena } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { Shell } from "@/components/portal/shell";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  const area = t("common.areaClients");
  return { title: { default: area, template: `%s | ${area}` }, robots: { index: false, follow: false } };
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const perfil = await requireCliente();
  if (await sinContrasena()) redirect("/contrasena");
  return (
    <Shell perfil={perfil} vista="cliente">
      {children}
    </Shell>
  );
}
