import { notFound } from "next/navigation";
import { dictionaries, isLocale } from "@/lib/dictionaries";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = dictionaries[locale].home;

  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl text-brand-yellow">⚓</div>

      <h1 className="mt-4 font-[family-name:var(--font-display)] text-6xl font-bold italic text-brand-yellow md:text-8xl">
        L&apos;Amiral
      </h1>

      <p className="mt-2 tracking-[0.5em] text-brand-yellow">RESTAURANT</p>

      <p className="mt-8 max-w-md text-lg text-brand-cream/80">{t.welcome}</p>

      <button className="mt-8 rounded-full bg-brand-yellow px-8 py-3 font-semibold text-brand-brown transition hover:opacity-90">
        {t.menuButton}
      </button>
    </main>
  );
}