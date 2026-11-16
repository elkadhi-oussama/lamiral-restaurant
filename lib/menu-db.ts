import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Category, Dish } from "@/lib/menu";

type DbDish = {
  slug: string;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  priceCents: number;
  emoji: string | null;
  imageUrl: string | null;
};

function toDish(d: DbDish): Dish {
  return {
    id: d.slug,
    name: { fr: d.nameFr, en: d.nameEn },
    description: { fr: d.descriptionFr, en: d.descriptionEn },
    price: d.priceCents / 100,
    emoji: d.emoji ?? "🍽️",
    image: d.imageUrl ?? undefined,
  };
}

export const getMenu = cache(async (): Promise<Category[]> => {
  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: {
      dishes: { where: { available: true }, orderBy: { position: "asc" } },
    },
  });

  return categories
    .filter((category) => category.dishes.length > 0)
    .map((category) => ({
      id: category.slug,
      name: { fr: category.nameFr, en: category.nameEn },
      dishes: category.dishes.map(toDish),
    }));
});

export async function getDishesBySlugs(slugs: string[]): Promise<Dish[]> {
  const rows = await prisma.dish.findMany({
    where: { slug: { in: slugs }, available: true },
  });

  return slugs
    .map((slug) => rows.find((row) => row.slug === slug))
    .filter((row) => row !== undefined)
    .map(toDish);
}