import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { isLocale, locales } from "@/lib/dictionaries";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <>
      <Suspense
        fallback={
          <header className="h-[72px] border-b border-brand-yellow/20 bg-brand-brown-light" />
        }
      >
        <Navbar locale={locale} />
      </Suspense>
      {children}
    </>
  );
}