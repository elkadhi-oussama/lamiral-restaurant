import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { isLocale } from "@/lib/dictionaries";
import { authText } from "@/lib/auth-text";
import { getCurrentUser } from "@/lib/session";

export default async function RegisterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  if (await getCurrentUser()) redirect(`/${locale}`);

  const { next } = await searchParams;
  const t = authText[locale];
  const suffix = next === "checkout" ? "?next=checkout" : "";

  return (
    <main className="mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold italic text-brand-yellow">
        {t.register}
      </h1>
      {next === "checkout" && (
        <p className="mt-4 text-brand-cream/80">{t.loginToOrder}</p>
      )}
      <AuthForm locale={locale} mode="register" next={next} />
      <p className="mt-6 text-sm text-brand-cream/70">
        {t.haveAccount}{" "}
        <Link
          href={`/${locale}/login${suffix}`}
          className="text-brand-yellow underline"
        >
          {t.login}
        </Link>
      </p>
    </main>
  );
}