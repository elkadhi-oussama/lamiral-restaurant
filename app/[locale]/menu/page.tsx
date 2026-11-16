
import { notFound } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/dictionaries";
import AddToCartButton from "@/components/AddToCartButton";
import DishImage from "@/components/DishImage";
import { formatPrice } from "@/lib/menu";
import { getMenu } from "@/lib/menu-db";

export const dynamic = "force-dynamic";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const t = dictionaries[locale].menuPage;
  const menu = await getMenu();

  return (
    <main>
      {/* Header */}
      <section className="px-6 pb-8 pt-16 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-bold italic text-brand-yellow">
          {t.title}
        </h1>
        <p className="mt-4 text-brand-cream/80">{t.subtitle}</p>
        <p className="mt-1 text-sm text-brand-yellow/80">{t.cashNote}</p>
      </section>

      {/* Category links */}
      <nav className="sticky top-[72px] z-10 border-y border-brand-yellow/20 bg-brand-brown/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl gap-3 overflow-x-auto px-6 py-3">
          {menu.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="shrink-0 rounded-full border border-brand-yellow/40 px-4 py-1.5 text-sm text-brand-yellow transition hover:bg-brand-yellow hover:text-brand-brown"
            >
              {category.name[locale]}
            </a>
          ))}
        </div>
      </nav>

      {/* Categories */}
      <div className="mx-auto max-w-5xl px-6 pb-20">
        {menu.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-32 pt-14"
          >
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold italic text-brand-yellow">
              {category.name[locale]}
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {category.dishes.map((dish) => (
                <article
                  key={dish.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-brand-yellow/20 bg-brand-brown-light"
                >
                  <DishImage dish={dish} className="h-36" />

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-brand-cream">
                        {dish.name[locale]}
                      </h3>
                      <span className="shrink-0 font-semibold text-brand-yellow">
                        {formatPrice(dish.price, locale)}
                      </span>
                    </div>

                    <p className="mt-2 flex-1 text-sm text-brand-cream/70">
                      {dish.description[locale]}
                    </p>

                    <AddToCartButton dishId={dish.id} locale={locale} />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
