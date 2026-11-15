import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { menu } from "../lib/menu";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  for (const [categoryIndex, category] of menu.entries()) {
    const dbCategory = await prisma.category.upsert({
      where: { slug: category.id },
      update: {
        nameFr: category.name.fr,
        nameEn: category.name.en,
        position: categoryIndex,
      },
      create: {
        slug: category.id,
        nameFr: category.name.fr,
        nameEn: category.name.en,
        position: categoryIndex,
      },
    });

    for (const [dishIndex, dish] of category.dishes.entries()) {
      const data = {
        categoryId: dbCategory.id,
        nameFr: dish.name.fr,
        nameEn: dish.name.en,
        descriptionFr: dish.description.fr,
        descriptionEn: dish.description.en,
        priceCents: Math.round(dish.price * 100),
        emoji: dish.emoji,
        imageUrl: dish.image ?? null,
        position: dishIndex,
      };

      await prisma.dish.upsert({
        where: { slug: dish.id },
        update: data,
        create: { slug: dish.id, ...data },
      });
    }
  }

  const categories = await prisma.category.count();
  const dishes = await prisma.dish.count();
  console.log(`Seed done: ${categories} categories, ${dishes} dishes`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());