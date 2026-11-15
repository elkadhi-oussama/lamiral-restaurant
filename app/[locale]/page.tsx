import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/dictionaries";
import { restaurant } from "@/lib/restaurant";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = dictionaries[locale].home;

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