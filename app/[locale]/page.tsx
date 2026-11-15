import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/dictionaries";
import { restaurant } from "@/lib/restaurant";
import AddToCartButton from "@/components/AddToCartButton";
import { findDish, formatPrice } from "@/lib/menu";
import { homeText, popularDishIds } from "@/lib/home-text";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = dictionaries[locale].home;
    const h = homeText[locale];
  const popularDishes = popularDishIds
    .map((id) => findDish(id))
    .filter((dish) => dish !== undefined);

  return (
    <main>
      {/* Hero */}
      <section className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl text-brand-yellow">⚓</div>

        <h1 className="mt-4 font-[family-name:var(--font-display)] text-6xl font-bold italic text-brand-yellow md:text-8xl">
          L&apos;Amiral
        </h1>

        <p className="mt-2 tracking-[0.5em] text-brand-yellow">RESTAURANT</p>
        <p className="mt-6 text-brand-cream/70">{t.tagline}</p>
        <p className="mt-6 max-w-md text-lg text-brand-cream/80">{t.welcome}</p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href={`/${locale}/menu`}
            className="rounded-full bg-brand-yellow px-8 py-3 font-semibold text-brand-brown transition hover:opacity-90"
          >
            {t.menuButton}
          </Link>
          <Link
            href={`/${locale}/menu`}
            className="rounded-full border border-brand-yellow px-8 py-3 font-semibold text-brand-yellow transition hover:bg-brand-yellow hover:text-brand-brown"
          >
            {t.orderOnline}
          </Link>
        </div>
      </section>

      {/* About */}
      <section className="bg-brand-brown-light px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-4xl font-bold italic text-brand-yellow">
            {t.aboutTitle}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-brand-cream/80">
            {t.aboutText}
          </p>
        </div>
      </section>

            {/* Popular dishes */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center font-[family-name:var(--font-display)] text-4xl font-bold italic text-brand-yellow">
            {h.popularTitle}
          </h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {popularDishes.map((dish) => (
              <article
                key={dish.id}
                className="overflow-hidden rounded-2xl border border-brand-yellow/20 bg-brand-brown-light"
              >
                <div className="flex h-32 items-center justify-center bg-brand-brown text-6xl">
                  {dish.emoji}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{dish.name[locale]}</h3>
                    <span className="shrink-0 font-semibold text-brand-yellow">
                      {formatPrice(dish.price, locale)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-brand-cream/70">
                    {dish.description[locale]}
                  </p>
                  <AddToCartButton dishId={dish.id} locale={locale} />
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href={`/${locale}/menu`}
              className="inline-block rounded-full border border-brand-yellow px-8 py-3 font-semibold text-brand-yellow transition hover:bg-brand-yellow hover:text-brand-brown"
            >
              {h.seeFullMenu}
            </Link>
          </div>
        </div>
      </section>

      {/* Practical info */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-[family-name:var(--font-display)] text-4xl font-bold italic text-brand-yellow">
            {t.infoTitle}
          </h2>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: t.addressLabel, value: restaurant.addressLine },
              { label: t.hoursLabel, value: t.hoursValue },
              { label: t.phoneLabel, value: restaurant.phone },
              { label: t.paymentLabel, value: t.paymentValue },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-brand-yellow/20 bg-brand-brown-light p-6 text-center"
              >
                <p className="text-sm uppercase tracking-widest text-brand-yellow">
                  {item.label}
                </p>
                <p className="mt-3 text-brand-cream/80">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}