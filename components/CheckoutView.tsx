"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import type { Locale } from "@/lib/dictionaries";
import { findDish, formatPrice } from "@/lib/menu";
import { shopText } from "@/lib/shop-text";

type PlacedOrder = { number: string; pickupTime: string };

export default function CheckoutView({ locale }: { locale: Locale }) {
  const { lines, total, clear } = useCart();
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const t = shopText[locale];

  const inputClass =
    "mt-1 w-full rounded-lg border border-brand-yellow/30 bg-brand-brown px-4 py-2.5 text-brand-cream outline-none focus:border-brand-yellow";

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const pickupTime = String(data.get("pickupTime") ?? "");
    const number = `LA-${Math.floor(1000 + Math.random() * 9000)}`;

    // Demo only: later this will be sent to the server and the database.
    clear();
    setOrder({ number, pickupTime });
  }

  // Confirmation screen
  if (order) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <div className="text-6xl">✅</div>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold italic text-brand-yellow">
          {t.confirmedTitle}
        </h1>
        <p className="mt-6 text-brand-cream/80">
          {t.orderNumber} :{" "}
          <span className="font-bold text-brand-yellow">{order.number}</span>
        </p>
        <p className="mt-2 text-brand-cream/80">
          {t.pickupAt} {order.pickupTime}
        </p>
        <p className="mt-6 text-brand-cream/80">{t.confirmedText}</p>
        <p className="mt-6 text-xs text-brand-cream/50">{t.demoNote}</p>
        <Link
          href={`/${locale}/menu`}
          className="mt-8 inline-block rounded-full bg-brand-yellow px-8 py-3 font-semibold text-brand-brown"
        >
          {t.backToMenu}
        </Link>
      </main>
    );
  }

  // Empty cart
  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="text-brand-cream/80">{t.empty}</p>
        <Link
          href={`/${locale}/menu`}
          className="mt-6 inline-block rounded-full bg-brand-yellow px-8 py-3 font-semibold text-brand-brown"
        >
          {t.backToMenu}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="text-center font-[family-name:var(--font-display)] text-5xl font-bold italic text-brand-yellow">
        {t.checkoutTitle}
      </h1>

      <div className="mt-10 grid gap-8 md:grid-cols-5">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 md:col-span-3">
          <h2 className="text-lg font-semibold text-brand-yellow">
            {t.yourDetails}
          </h2>

          <label className="block text-sm">
            {t.name}
            <input
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              autoComplete="name"
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            {t.phone}
            <input
              name="phone"
              type="tel"
              required
              pattern="[0-9+ ().\-]{8,20}"
              autoComplete="tel"
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            {t.pickupTime}
            <input
              name="pickupTime"
              type="time"
              required
              className={inputClass}
            />
          </label>

          <label className="block text-sm">
            {t.note}
            <textarea
              name="note"
              rows={3}
              maxLength={300}
              className={inputClass}
            />
          </label>

          <div className="rounded-xl border border-brand-yellow/30 bg-brand-brown-light p-4">
            <p className="text-sm font-semibold text-brand-yellow">
              {t.paymentTitle}
            </p>
            <p className="mt-1 text-sm text-brand-cream/80">
              💶 {t.paymentText}
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-brand-yellow py-3 font-semibold text-brand-brown transition hover:opacity-90"
          >
            {t.place}
          </button>
        </form>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-brand-yellow/20 bg-brand-brown-light p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-brand-yellow">
            {t.summary}
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((line) => {
              const dish = findDish(line.id);
              if (!dish) return null;
              return (
                <li key={line.id} className="flex justify-between gap-3">
                  <span>
                    {line.qty} × {dish.name[locale]}
                  </span>
                  <span className="shrink-0">
                    {formatPrice(dish.price * line.qty, locale)}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 flex justify-between border-t border-brand-yellow/20 pt-4 font-bold">
            <span>{t.total}</span>
            <span className="text-brand-yellow">
              {formatPrice(total, locale)}
            </span>
          </div>
        </aside>
      </div>
    </main>
  );
}