"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { dictionaries, type Locale } from "@/lib/dictionaries";
import { useCart } from "@/components/CartProvider";

export default function Navbar({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const t = dictionaries[locale].nav;
  const { count } = useCart()

  const otherLocale: Locale = locale === "fr" ? "en" : "fr";
  const switchHref = pathname.replace(/^\/(fr|en)/, `/${otherLocale}`);

  const links = [
    { href: `/${locale}`, label: t.home },
    { href: `/${locale}/menu`, label: t.menu },
    { href: `/${locale}/login`, label: t.login },
  ];

  function isActive(href: string) {
    return href === `/${locale}` ? pathname === href : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-brand-yellow/20 bg-brand-brown">
      <nav className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          onClick={() => setOpen(false)}
          className="flex items-center gap-2 font-[family-name:var(--font-display)] text-2xl font-bold italic text-brand-yellow"
        >
          <span className="text-xl not-italic">⚓</span>
          L&apos;Amiral
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm uppercase tracking-widest transition hover:text-brand-yellow ${
                isActive(link.href)
                  ? "text-brand-yellow"
                  : "text-brand-cream/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <Link
            href={switchHref}
            className="rounded-full border border-brand-yellow px-3 py-1 text-sm font-semibold uppercase text-brand-yellow transition hover:bg-brand-yellow hover:text-brand-brown"
          >
            {otherLocale}
          </Link>

          <Link
            href={`/${locale}/cart`}
            aria-label={t.cart}
            className="relative rounded-full bg-brand-yellow p-2 text-brand-brown transition hover:opacity-90"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-cream px-1 text-xs font-bold text-brand-brown">
                {count}
              </span>
            )}
          </Link>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
            aria-expanded={open}
            className="rounded-md p-2 text-brand-yellow md:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-6 w-6"
            >
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-brand-yellow/20 bg-brand-brown md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col px-6 py-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`border-b border-brand-yellow/10 py-3 text-sm uppercase tracking-widest last:border-b-0 ${
                  isActive(link.href)
                    ? "text-brand-yellow"
                    : "text-brand-cream/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}