import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPerfil } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { MfaPanel } from "@/components/portal/mfa-panel";
import { I18nBoundary } from "@/components/portal/i18n-boundary";
import { Prefs } from "@/components/portal/prefs";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("mfa.metaTitle"), robots: { index: false, follow: false } };
}

export default async function MfaPage({
  searchParams,
}: {
  searchParams: Promise<{ siguiente?: string }>;
}) {
  const perfil = await getPerfil();
  if (!perfil || perfil.role !== "admin") redirect("/login");

  // Tras el TOTP, la recuperación de contraseña sigue a /contrasena; todo lo demás, al panel.
  const destino = (await searchParams).siguiente === "contrasena" ? "/contrasena" : "/admin";

  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.currentLevel === "aal2") redirect(destino);

  return (
    <I18nBoundary>
      <div className="bg-paper text-ink flex min-h-dvh flex-col">
        <header className="flex justify-end px-4 py-5 md:px-8">
          <Prefs />
        </header>
        <main
          id="main"
          tabIndex={-1}
          className="flex flex-1 items-center justify-center px-4 pb-16"
        >
          <Aparece>
            <div className="border-rule bg-paper-alt w-[min(420px,calc(100vw-2rem))] rounded-2xl border p-6 md:p-8">
              <MfaPanel destino={destino} />
            </div>
          </Aparece>
        </main>
      </div>
    </I18nBoundary>
  );
}
