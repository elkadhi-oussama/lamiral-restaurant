
import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import { isLocale, locales } from "@/lib/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { getMenu } from "@/lib/menu-db";

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

  const [user, menu] = await Promise.all([getCurrentUser(), getMenu()]);
  const dishes = menu.flatMap((category) => category.dishes);

  return (
    <CartProvider dishes={dishes}>
      <Suspense
        fallback={
          <header className="h-[72px] border-b border-brand-yellow/20 bg-brand-brown" />
        }
      >
        <Navbar
          locale={locale}
          user={user ? { name: user.name, role: user.role } : null}
        />
      </Suspense>
      {children}
      <Footer locale={locale} />
    </CartProvider>
  );
}
