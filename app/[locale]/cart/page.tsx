import { notFound } from "next/navigation";
import CartView from "@/components/CartView";
import { isLocale } from "@/lib/dictionaries";
import { getCurrentUser } from "@/lib/session";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  return <CartView locale={locale} loggedIn={Boolean(user)} />;
}