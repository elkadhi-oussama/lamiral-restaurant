import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { isLocale, locales } from "@/lib/dictionaries";
import { getCurrentUser } from "@/lib/session";

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

  const user = await getCurrentUser();

  return (
    <CartProvider>
      <Suspense
        fallback={
          <header className="h-[72px] border-b border-brand-yellow/20 bg-brand-brown" />
        }
      >
        <Navbar locale={locale} user={user ? { name: user.name } : null} />
      </Suspense>
      {children}
      <Footer locale={locale} />
    </CartProvider>
  );
}