"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import type { Locale } from "@/lib/dictionaries";
import { findDish, formatPrice } from "@/lib/menu";
import { shopText } from "@/lib/shop-text";

export default function CartView({ locale }: { locale: Locale }) {
  const { lines, total, setQty, remove } = useCart();
  const t = shopText[locale];

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-center font-[family-name:var(--font-display)] text-5xl font-bold italic text-brand-yellow">
        {t.cartTitle}
      </h1>

      {lines.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-brand-cream/80">{t.empty}</p>
          <Link
            href={`/${locale}/menu`}
            className="mt-6 inline-block rounded-full bg-brand-yellow px-8 py-3 font-semibold text-brand-brown"
          >
            {t.backToMenu}
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 space-y-4">
            {lines.map((line) => {
              const dish = findDish(line.id);
              if (!dish) return null;
              return (
                <li
                  key={line.id}
                  className="flex items-center gap-4 rounded-2xl border border-brand-yellow/20 bg-brand-brown-light p-4"
                >
                  <div className="text-4xl">{dish.emoji}</div>

                  <div className="flex-1">
                    <p className="font-semibold">{dish.name[locale]}</p>
                    <p className="text-sm text-brand-yellow">
                      {formatPrice(dish.price, locale)}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      className="mt-1 text-xs text-brand-cream/60 underline hover:text-brand-yellow"
                    >
                      {t.remove}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty - 1)}
                      className="h-8 w-8 rounded-full border border-brand-yellow text-brand-yellow"
                      aria-label="-"
                    >
                      −
                    </button>
                    <span className="w-5 text-center">{line.qty}</span>
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty + 1)}
                      className="h-8 w-8 rounded-full border border-brand-yellow text-brand-yellow"
                      aria-label="+"
                    >
                      +
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex items-center justify-between border-t border-brand-yellow/20 pt-6">
            <span className="text-lg">{t.total}</span>
            <span className="text-2xl font-bold text-brand-yellow">
              {formatPrice(total, locale)}
            </span>
          </div>

          <Link
            href={`/${locale}/checkout`}
            className="mt-8 block rounded-full bg-brand-yellow py-3 text-center font-semibold text-brand-brown transition hover:opacity-90"
          >
            {t.checkout}
          </Link>
        </>
      )}
    </main>
  );
}