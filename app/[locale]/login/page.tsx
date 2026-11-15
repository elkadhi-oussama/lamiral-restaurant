import { notFound } from "next/navigation";
import ComingSoon from "@/components/ComingSoon";
import { isLocale } from "@/lib/dictionaries";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <ComingSoon locale={locale} page="login" />;
}