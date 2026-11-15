"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dictionaries, type Locale } from "@/lib/dictionaries";

export default function Navbar({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const t = dictionaries[locale].nav;
  const otherLocale: Locale = locale === "fr" ? "en" : "fr";
  const switchHref = pathname.replace(/^\/(fr|en)/, `/${otherLocale}`);

  return (
    <header className="border-b border-brand-yellow/20 bg-brand-brown-light">
      <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        <Link
          href={`/${locale}`}
          className="font-[family-name:var(--font-display)] text-2xl font-bold italic text-brand-yellow"
        >
          ⚓ L&apos;Amiral
        </Link>

        <div className="flex items-center gap-6 text-sm">
          <Link href={`/${locale}`} className="hover:text-brand-yellow">
            {t.home}
          </Link>
          <Link href={`/${locale}/menu`} className="hover:text-brand-yellow">
            {t.menu}
          </Link>
          <Link href={`/${locale}/cart`} className="hover:text-brand-yellow">
            {t.cart}
          </Link>
          <Link href={`/${locale}/login`} className="hover:text-brand-yellow">
            {t.login}
          </Link>
          <Link
            href={switchHref}
            className="rounded-full border border-brand-yellow px-3 py-1 font-semibold text-brand-yellow uppercase hover:bg-brand-yellow hover:text-brand-brown"
          >
            {otherLocale}
          </Link>
        </div>
      </nav>
    </header>
  );
}