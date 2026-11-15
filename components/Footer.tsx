import Link from "next/link";
import type { Locale } from "@/lib/dictionaries";
import { homeText } from "@/lib/home-text";
import { restaurant } from "@/lib/restaurant";

export default function Footer({ locale }: { locale: Locale }) {
  const t = homeText[locale];

  return (
    <footer className="border-t border-brand-yellow/20 bg-brand-brown-light">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold italic text-brand-yellow">
            ⚓ L&apos;Amiral
          </p>
          <p className="mt-3 text-sm text-brand-cream/70">{t.footerTagline}</p>
          <p className="mt-3 text-sm text-brand-cream/70">
            💶 {t.footerPayment}
          </p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-brand-yellow">
            {t.footerContact}
          </p>
          <p className="mt-3 text-sm text-brand-cream/80">
            {restaurant.addressLine}
          </p>
          <p className="mt-1 text-sm text-brand-cream/80">
            <a href={`tel:${restaurant.phone.replace(/\s/g, "")}`}>
              {restaurant.phone}
            </a>
          </p>
        </div>

        <div>
          <p className="text-sm uppercase tracking-widest text-brand-yellow">
            {t.footerHours}
          </p>
          <ul className="mt-3 space-y-1 text-sm text-brand-cream/80">
            {t.hoursLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-yellow/10 py-4 text-center text-xs text-brand-cream/50">
        © {new Date().getFullYear()} L&apos;Amiral. {t.rights}{" "}
        <Link href={`/${locale}/menu`} className="hover:text-brand-yellow">
          Menu
        </Link>
      </div>
    </footer>
  );
}