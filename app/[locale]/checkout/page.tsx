import { notFound, redirect } from "next/navigation";
import CheckoutView from "@/components/CheckoutView";
import { isLocale } from "@/lib/dictionaries";
import { getCurrentUser } from "@/lib/session";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login?next=checkout`);

  return (
    <CheckoutView
      locale={locale}
      defaultName={user.name}
      defaultPhone={user.phone ?? ""}
    />
  );
}