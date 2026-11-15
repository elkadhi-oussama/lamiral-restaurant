
"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { frenchPhoneSchema } from "@/lib/phone";
import { getCurrentUser } from "@/lib/session";
import { encryptField } from "@/lib/crypto";

const orderSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: frenchPhoneSchema,
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  note: z.string().trim().max(300).optional(),
  items: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        qty: z.number().int().min(1).max(20),
      }),
    )
    .min(1)
    .max(30),
});

const messages = {
  fr: {
    invalid: "Merci de vérifier vos informations.",
    unavailable: "Un plat de votre panier n'est plus disponible.",
    failed: "La commande n'a pas pu être enregistrée. Réessayez.",
    loginRequired: "Connectez-vous pour passer commande.",
  },
  en: {
    invalid: "Please check your details.",
    unavailable: "A dish in your cart is no longer available.",
    failed: "The order could not be saved. Please try again.",
    loginRequired: "Please log in to place an order.",
  },
};

// Specific validation messages
const fieldMessages = {
  fr: {
    name: "Nom invalide (2 caractères minimum).",
    phone: "Numéro de téléphone français invalide (ex. 06 12 34 56 78).",
    pickupTime: "Heure de retrait invalide.",
    note: "La remarque est trop longue (300 caractères maximum).",
    items: "Votre panier est vide ou invalide.",
  },
  en: {
    name: "Invalid name (2 characters minimum).",
    phone: "Invalid French phone number (e.g. 06 12 34 56 78).",
    pickupTime: "Invalid pickup time.",
    note: "The note is too long (300 characters maximum).",
    items: "Your cart is empty or invalid.",
  },
} satisfies Record<"fr" | "en", Record<string, string>>;

function makeOrderNumber(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `LA-${digits}`;
}

export async function placeOrder(locale: "fr" | "en", input: unknown) {
  const lang = locale === "en" ? "en" : "fr";
  const text = messages[lang];

  // Require an authenticated user
  const user = await getCurrentUser();

  if (!user) {
    return { ok: false as const, error: text.loginRequired };
  }

  const parsed = orderSchema.safeParse(input);

  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? "");
    const specific = (fieldMessages[lang] as Record<string, string>)[field];

    return {
      ok: false as const,
      error: specific ?? text.invalid,
    };
  }

  const data = parsed.data;

  // Merge duplicate lines, then load the real dishes and prices
  const wanted = new Map<string, number>();

  for (const item of data.items) {
    wanted.set(
      item.id,
      Math.min((wanted.get(item.id) ?? 0) + item.qty, 20),
    );
  }

  const dishes = await prisma.dish.findMany({
    where: {
      slug: { in: [...wanted.keys()] },
      available: true,
    },
  });

  if (dishes.length !== wanted.size) {
    return { ok: false as const, error: text.unavailable };
  }

  const lines = dishes.map((dish) => ({
    dishId: dish.id,
    nameSnapshot: dish.nameFr,
    unitPriceCents: dish.priceCents,
    quantity: wanted.get(dish.slug) ?? 1,
  }));

  const totalCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0,
  );

  for (let attempt = 0; attempt < 3; attempt++) {
    const number = makeOrderNumber();

    try {
      await prisma.order.create({
        data: {
          number,
          userId: user.id,
          customerName: data.name,
          customerPhone: encryptField(data.phone),
          pickupTime: data.pickupTime,
          note: data.note || null,
          totalCents,
          items: { create: lines },
        },
      });

      return {
        ok: true as const,
        number,
        pickupTime: data.pickupTime,
        totalCents,
      };
    } catch (error) {
      // P2002 = this order number already exists
      if ((error as { code?: string }).code !== "P2002") break;
    }
  }

  return { ok: false as const, error: text.failed };
}
