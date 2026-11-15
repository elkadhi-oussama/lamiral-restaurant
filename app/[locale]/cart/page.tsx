import { notFound } from "next/navigation";
import CartView from "@/components/CartView";
import { isLocale } from "@/lib/dictionaries";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <CartView locale={locale} />;
}