import Link from "next/link";
import type { Locale } from "@/lib/dictionaries";
import { soonText } from "@/lib/soon-text";

export default function ComingSoon({
  locale,
  page,
}: {
  locale: Locale;
  page: "login" | "register" | "account";
}) {
  const t = soonText[locale];

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl text-brand-yellow">⚓</div>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl font-bold italic text-brand-yellow">
        {t[page]}
      </h1>
      <p className="mt-4 max-w-md text-brand-cream/80">{t.message}</p>
      <Link
        href={`/${locale}`}
        className="mt-8 rounded-full bg-brand-yellow px-8 py-3 font-semibold text-brand-brown transition hover:opacity-90"
      >
        {t.back}
      </Link>
    </main>
  );
}