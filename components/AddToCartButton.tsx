"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Locale } from "@/lib/dictionaries";
import { shopText } from "@/lib/shop-text";

export default function AddToCartButton({
  dishId,
  locale,
}: {
  dishId: string;
  locale: Locale;
}) {
  const { add } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const t = shopText[locale];

  function handleClick() {
    add(dishId);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mt-4 w-full rounded-full bg-brand-yellow py-2 text-sm font-semibold text-brand-brown transition hover:opacity-90"
    >
      {justAdded ? t.added : t.add}
    </button>
  );
}