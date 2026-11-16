
"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import DishImage from "@/components/DishImage";
import type { Locale } from "@/lib/dictionaries";
import { formatPrice } from "@/lib/menu";
import { shopText } from "@/lib/shop-text";
import { placeOrder } from "@/app/[locale]/checkout/actions";

type PlacedOrder = {
  number: string;
  pickupTime: string;
  totalCents: number;
};

export default function CheckoutView({
  locale,
  defaultName,
  defaultPhone,
}: {
  locale: Locale;
  defaultName: string;
  defaultPhone: string;
}) {
  const { lines, total, clear, find } = useCart();

  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const t = shopText[locale];

  const inputClass =
    "mt-1 w-full rounded-lg border border-brand-yellow/30 bg-brand-brown px-4 py-2.5 text-brand-cream outline-none focus:border-brand-yellow";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (pending) return;

    const data = new FormData(event.currentTarget);

    setPending(true);
    setError(null);

    try {
      const result = await placeOrder(locale, {
        name: String(data.get("name") ?? ""),
        phone: String(data.get("phone") ?? ""),
        pickupTime: String(data.get("pickupTime") ?? ""),
        note: String(data.get("note") ?? ""),
        items: lines.map((line) => ({
          id: line.id,
          qty: line.qty,
        })),
      });

      if (result.ok) {
        clear();

        setOrder({
          number: result.number,
          pickupTime: result.pickupTime,
          totalCents: result.totalCents,
        });
      } else {
        setError(result.error);
      }
    } catch {
      setError(
        locale === "fr"
          ? "Erreur de connexion. Réessayez."
          : "Connection error. Please try again.",
      );
    } finally {
      setPending(false);
    }
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
          <span className="font-bold text-brand-yellow">
            {order.number}
          </span>
        </p>

        <p className="mt-2 text-brand-cream/80">
          {t.pickupAt} {order.pickupTime}
        </p>

        <p className="mt-2 text-brand-cream/80">
          {t.total} : {formatPrice(order.totalCents / 100, locale)}
        </p>

        <p className="mt-6 text-brand-cream/80">
          {t.confirmedText}
        </p>

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
        <form
          onSubmit={handleSubmit}
          className="space-y-5 md:col-span-3"
        >
          <h2 className="text-lg font-semibold text-brand-yellow">
            {t.yourDetails}
          </h2>

          {/* Name */}
          <label className="block text-sm">
            {t.name}
            <input
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={80}
              defaultValue={defaultName}
              autoComplete="name"
              className={inputClass}
            />
          </label>

          {/* Phone */}
          <label className="block text-sm">
            {t.phone}
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              required
              defaultValue={defaultPhone}
              placeholder="06 12 34 56 78"
              pattern="(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}"
              autoComplete="tel"
              className={inputClass}
            />
          </label>

          {/* Pickup time */}
          <label className="block text-sm">
            {t.pickupTime}
            <input
              name="pickupTime"
              type="time"
              required
              className={inputClass}
            />
          </label>

          {/* Note */}
          <label className="block text-sm">
            {t.note}
            <textarea
              name="note"
              rows={3}
              maxLength={300}
              className={inputClass}
            />
          </label>

          {/* Payment */}
          <div className="rounded-xl border border-brand-yellow/30 bg-brand-brown-light p-4">
            <p className="text-sm font-semibold text-brand-yellow">
              {t.paymentTitle}
            </p>

            <p className="mt-1 text-sm text-brand-cream/80">
              💶 {t.paymentText}
            </p>
          </div>

          {/* Error message */}
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-brand-yellow py-3 font-semibold text-brand-brown transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "…" : t.place}
          </button>
        </form>

        {/* Summary */}
        <aside className="h-fit rounded-2xl border border-brand-yellow/20 bg-brand-brown-light p-6 md:col-span-2">
          <h2 className="text-lg font-semibold text-brand-yellow">
            {t.summary}
          </h2>

          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((line) => {
              const dish = find(line.id);

              if (!dish) return null;

              return (
                <li
                  key={line.id}
                  className="flex items-center gap-3"
                >
                  <DishImage
                    dish={dish}
                    className="h-12 w-12 shrink-0 rounded-lg"
                  />

                  <span className="flex-1">
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
