import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getPerfil } from "@/lib/portal/auth";
import { createClient } from "@/lib/supabase/server";
import { getI18n } from "@/lib/portal/i18n";
import { PasswordForm } from "@/components/portal/password-form";
import { I18nBoundary } from "@/components/portal/i18n-boundary";
import { Prefs } from "@/components/portal/prefs";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("password.metaTitle"), robots: { index: false, follow: false } };
}

export default async function PasswordPage() {
  const perfil = await getPerfil();
  if (!perfil || perfil.role !== "cliente") redirect("/login");

  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  const temporal = user?.user_metadata?.password_temporary === true;

  return (
    <I18nBoundary>
      <div className="flex min-h-dvh flex-col bg-paper text-ink">
        <header className="flex justify-end px-4 py-5 md:px-8">
          <Prefs />
        </header>
        <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-4 pb-16">
          <Aparece>
            <div className="w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-rule bg-paper-alt p-6 md:p-8">
              <PasswordForm temporal={temporal} />
            </div>
          </Aparece>
        </main>
      </div>
    </I18nBoundary>
  );
}
