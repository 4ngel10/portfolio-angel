import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPerfil } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { createClient } from "@/lib/supabase/server";
import { MfaPanel } from "@/components/portal/mfa-panel";
import { I18nBoundary } from "@/components/portal/i18n-boundary";
import { Prefs } from "@/components/portal/prefs";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("mfa.metaTitle"), robots: { index: false, follow: false } };
}

export default async function MfaPage() {
  const perfil = await getPerfil();
  if (!perfil || perfil.role !== "admin") redirect("/login");

  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data?.currentLevel === "aal2") redirect("/admin");

  return (
    <I18nBoundary>
      <div className="flex min-h-dvh flex-col bg-paper text-ink">
        <header className="flex justify-end px-4 py-5 md:px-8">
          <Prefs />
        </header>
        <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-4 pb-16">
          <div className="w-full max-w-[420px] rounded-2xl border border-rule bg-paper-alt p-6 md:p-8">
            <MfaPanel />
          </div>
        </main>
      </div>
    </I18nBoundary>
  );
}
