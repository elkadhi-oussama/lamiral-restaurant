import { notFound } from "next/navigation";
import CheckoutView from "@/components/CheckoutView";
import { isLocale } from "@/lib/dictionaries";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <CheckoutView locale={locale} />;
}