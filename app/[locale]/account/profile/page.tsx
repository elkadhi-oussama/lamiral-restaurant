import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import ProfileForm from "@/components/ProfileForm";
import { isLocale } from "@/lib/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { readAddress } from "@/lib/profile";
import { profileText } from "@/lib/profile-text";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { address: true },
  });
  const address = readAddress(row?.address ?? null);
  const t = profileText[locale];

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="text-center font-[family-name:var(--font-display)] text-5xl font-bold italic text-brand-yellow">
        {t.title}
      </h1>
      <ProfileForm
        locale={locale}
        defaults={{
          name: user.name,
          phone: user.phone ?? "",
          street: address?.street ?? "",
          postalCode: address?.postalCode ?? "",
          city: address?.city ?? "",
          extra: address?.extra ?? "",
          avatarUrl: user.avatarUrl,
        }}
      />
      <p className="mt-6 text-center text-sm">
        <Link href={`/${locale}/account`} className="text-brand-yellow underline">
          {t.back}
        </Link>
      </p>
    </main>
  );
}