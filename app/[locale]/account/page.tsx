
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isLocale } from "@/lib/dictionaries";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/menu";
import { accountText } from "@/lib/account-text";
import { authText } from "@/lib/auth-text";
import { profileText } from "@/lib/profile-text";
import { readAddress } from "@/lib/profile";
import { logout } from "@/lib/auth-actions";

export default async function AccountPage({
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

  const t = accountText[locale];
  const a = authText[locale];
  const p = profileText[locale];

  // Only this customer's orders
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { items: { include: { dish: true } } },
  });

  const dateFormat = new Intl.DateTimeFormat(
    locale === "fr" ? "fr-FR" : "en-GB",
    {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Paris",
    },
  );

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-center font-[family-name:var(--font-display)] text-5xl font-bold italic text-brand-yellow">
        {t.title}
      </h1>

      {/* Profile */}
      <section className="mt-10 rounded-2xl border border-brand-yellow/20 bg-brand-brown-light p-6">
        <h2 className="text-lg font-semibold text-brand-yellow">
          {t.profile}
        </h2>

        <div className="mt-4 flex items-center gap-4">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-yellow text-2xl font-bold text-brand-brown">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          <Link
            href={`/${locale}/account/profile`}
            className="text-sm text-brand-yellow underline"
          >
            {p.edit}
          </Link>
        </div>

        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-brand-cream/60">{a.name}</dt>
            <dd>{user.name}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-brand-cream/60">{a.email}</dt>
            <dd>{user.email}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-brand-cream/60">{a.phone}</dt>
            <dd>{user.phone ?? "—"}</dd>
          </div>

          <div className="flex justify-between gap-4">
            <dt className="text-brand-cream/60">{p.street}</dt>
            <dd className="text-right">
              {address
                ? `${address.street}, ${address.postalCode} ${address.city}${
                    address.extra ? ` (${address.extra})` : ""
                  }`
                : "—"}
            </dd>
          </div>
        </dl>

        <form action={logout.bind(null, locale)} className="mt-6">
          <button
            type="submit"
            className="rounded-full border border-brand-yellow px-6 py-2 text-sm font-semibold text-brand-yellow transition hover:bg-brand-yellow hover:text-brand-brown"
          >
            {a.logout}
          </button>
        </form>

        {/* Admin link - visible only to administrators */}
        {user.role === "ADMIN" && (
          <Link
            href="/admin"
            className="mt-4 inline-block text-sm text-brand-yellow underline"
          >
            Administration
          </Link>
        )}
      </section>

      {/* Order history */}
      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-yellow">
          {t.orders}
        </h2>

        {orders.length === 0 ? (
          <div className="mt-6 text-center">
            <p className="text-brand-cream/80">{t.noOrders}</p>

            <Link
              href={`/${locale}/menu`}
              className="mt-4 inline-block rounded-full bg-brand-yellow px-8 py-3 font-semibold text-brand-brown"
            >
              {t.seeMenu}
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="rounded-2xl border border-brand-yellow/20 bg-brand-brown-light p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">
                    {t.order} {order.number}
                  </p>

                  <span className="rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-semibold text-brand-yellow">
                    {t.status[order.status] ?? order.status}
                  </span>
                </div>

                <p className="mt-1 text-xs text-brand-cream/60">
                  {dateFormat.format(order.createdAt)} · {t.pickup}{" "}
                  {order.pickupTime}
                </p>

                <ul className="mt-3 space-y-1 text-sm">
                  {order.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex justify-between gap-3"
                    >
                      <span>
                        {item.quantity} ×{" "}
                        {item.dish
                          ? locale === "en"
                            ? item.dish.nameEn
                            : item.dish.nameFr
                          : item.nameSnapshot}
                      </span>

                      <span className="shrink-0">
                        {formatPrice(
                          (item.unitPriceCents * item.quantity) / 100,
                          locale,
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-3 flex justify-between border-t border-brand-yellow/20 pt-3 font-bold">
                  <span>{t.total}</span>

                  <span className="text-brand-yellow">
                    {formatPrice(order.totalCents / 100, locale)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
