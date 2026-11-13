import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getPerfil } from "@/lib/portal/auth";
import { getI18n } from "@/lib/portal/i18n";
import { LoginForm } from "@/components/portal/login-form";
import { I18nBoundary } from "@/components/portal/i18n-boundary";
import { Prefs } from "@/components/portal/prefs";
import { Aparece } from "@/components/portal/aparece";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("login.metaTitle"), robots: { index: false, follow: false } };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const perfil = await getPerfil();
  if (perfil?.role === "admin") redirect("/admin");
  if (perfil?.role === "cliente") redirect("/portal");

  const { error } = await searchParams;
  const { t } = await getI18n();
  const aviso = error === "enlace" ? t("login.linkExpired") : error === "sin-acceso" ? t("login.noAccess") : undefined;

  return (
    <I18nBoundary>
      <div className="flex min-h-dvh flex-col bg-paper text-ink">
        <header className="flex items-center justify-between px-4 py-5 md:px-8">
          <Link href="/" className="text-sm font-medium text-muted transition-colors hover:text-ink">
            {t("common.backToSite")}
          </Link>
          <Prefs />
        </header>
        <main id="main" tabIndex={-1} className="flex flex-1 items-center justify-center px-4 pb-16">
          <Aparece>
            <div className="w-[min(420px,calc(100vw-2rem))] rounded-2xl border border-rule bg-paper-alt p-6 md:p-8">
              <LoginForm aviso={aviso} />
            </div>
          </Aparece>
        </main>
      </div>
    </I18nBoundary>
  );
}
