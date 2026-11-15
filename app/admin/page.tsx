
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { decryptField } from "@/lib/crypto";
import { formatPhone } from "@/lib/phone";
import { formatPrice } from "@/lib/menu";
import { statusInfo, transitions } from "@/lib/order-status";
import {
  deleteOrder,
  forceOrderStatus,
  updateOrderDetails,
  updateOrderStatus,
} from "@/app/admin/actions";
import ConfirmButton from "@/components/ConfirmButton";
import AutoRefresh from "@/components/AutoRefresh";

const FILTERS = {
  active: {
    label: "En cours",
    statuses: ["PENDING", "ACCEPTED", "PREPARING", "READY"],
  },
  pending: { label: "À traiter", statuses: ["PENDING"] },
  done: { label: "Terminées", statuses: ["COMPLETED", "REJECTED", "CANCELLED"] },
  all: { label: "Toutes", statuses: null },
} as const;

type FilterKey = keyof typeof FILTERS;

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();

  const { status } = await searchParams;
  const key: FilterKey =
    status && status in FILTERS ? (status as FilterKey) : "active";
  const statuses = FILTERS[key].statuses;

  const [orders, pendingCount] = await Promise.all([
    prisma.order.findMany({
      where: statuses ? { status: { in: [...statuses] } } : {},
      orderBy: {
        createdAt: key === "active" || key === "pending" ? "asc" : "desc",
      },
      take: 100,
      include: { items: { include: { dish: true } } },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);

  const dateFormat = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Paris",
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <AutoRefresh seconds={30} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold italic text-brand-yellow">
          Commandes
        </h1>

        <nav className="flex flex-wrap gap-2">
          {(Object.keys(FILTERS) as FilterKey[]).map((filterKey) => (
            <Link
              key={filterKey}
              href={`/admin?status=${filterKey}`}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${
                key === filterKey
                  ? "border-brand-yellow bg-brand-yellow text-brand-brown"
                  : "border-brand-yellow/40 text-brand-yellow hover:bg-brand-yellow/10"
              }`}
            >
              {FILTERS[filterKey].label}
              {filterKey === "pending" && pendingCount > 0 &&
                ` (${pendingCount})`}
            </Link>
          ))}
        </nav>
      </div>

      {orders.length === 0 ? (
        <p className="mt-16 text-center text-brand-cream/70">
          Aucune commande dans cette liste.
        </p>
      ) : (
        <ul className="mt-8 space-y-5">
          {orders.map((order) => {
            const info = statusInfo[order.status];
            const phone = decryptField(order.customerPhone);
            const nextStatuses = transitions[order.status] ?? [];

            return (
              <li
                key={order.id}
                className={`rounded-2xl border bg-brand-brown-light p-5 ${
                  order.status === "PENDING"
                    ? "border-brand-yellow"
                    : "border-brand-yellow/20"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{order.number}</p>
                    <p className="text-xs text-brand-cream/60">
                      Reçue le {dateFormat.format(order.createdAt)}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      info?.badge ?? ""
                    }`}
                  >
                    {info?.label ?? order.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div className="text-sm">
                    <p className="text-brand-cream/60">Client</p>
                    <p className="font-semibold">{order.customerName}</p>

                    <p className="mt-1">
                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="text-brand-yellow underline"
                        >
                          📞 {formatPhone(phone)}
                        </a>
                      ) : (
                        <span className="text-brand-cream/60">
                          Téléphone indisponible
                        </span>
                      )}
                    </p>

                    <p className="mt-3 text-brand-cream/60">
                      Retrait prévu à
                    </p>
                    <p className="text-lg font-bold text-brand-yellow">
                      {order.pickupTime}
                    </p>

                    {order.note && (
                      <p className="mt-3 rounded-lg bg-brand-brown p-3 text-brand-cream/80">
                        💬 {order.note}
                      </p>
                    )}
                  </div>

                  <div className="text-sm">
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between gap-3"
                        >
                          <span>
                            {item.quantity} ×{" "}
                            {item.dish?.nameFr ?? item.nameSnapshot}
                          </span>
                          <span className="shrink-0">
                            {formatPrice(
                              (item.unitPriceCents * item.quantity) / 100,
                              "fr",
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-3 flex justify-between border-t border-brand-yellow/20 pt-3 text-base font-bold">
                      <span>Total (espèces)</span>
                      <span className="text-brand-yellow">
                        {formatPrice(order.totalCents / 100, "fr")}
                      </span>
                    </p>
                  </div>
                </div>

                {nextStatuses.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    {nextStatuses.map((next) => {
                      const negative =
                        next === "REJECTED" || next === "CANCELLED";

                      return (
                        <form key={next} action={updateOrderStatus}>
                          <input
                            type="hidden"
                            name="orderId"
                            value={order.id}
                          />
                          <input
                            type="hidden"
                            name="status"
                            value={next}
                          />
                          <button
                            type="submit"
                            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                              negative
                                ? "border border-red-400 text-red-300 hover:bg-red-500/10"
                                : "bg-brand-yellow text-brand-brown hover:opacity-90"
                            }`}
                          >
                            {statusInfo[next]?.action ?? next}
                          </button>
                        </form>
                      );
                    })}
                  </div>
                )}

                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer text-brand-cream/60">
                    Options avancées
                  </summary>

                  <div className="mt-3 space-y-3">
                    <form
                      action={updateOrderDetails}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input
                        type="hidden"
                        name="orderId"
                        value={order.id}
                      />
                      <input
                        type="time"
                        name="pickupTime"
                        defaultValue={order.pickupTime}
                        required
                        className="rounded-lg border border-brand-yellow/30 bg-brand-brown px-3 py-1.5"
                      />
                      <input
                        name="note"
                        defaultValue={order.note ?? ""}
                        maxLength={300}
                        placeholder="Remarque"
                        className="min-w-48 flex-1 rounded-lg border border-brand-yellow/30 bg-brand-brown px-3 py-1.5"
                      />
                      <button
                        type="submit"
                        className="rounded-full bg-brand-yellow px-5 py-1.5 font-semibold text-brand-brown"
                      >
                        Enregistrer
                      </button>
                    </form>

                    <div className="flex flex-wrap items-center gap-3">
                      <form
                        action={forceOrderStatus}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="hidden"
                          name="orderId"
                          value={order.id}
                        />
                        <select
                          name="status"
                          defaultValue={order.status}
                          className="rounded-lg border border-brand-yellow/30 bg-brand-brown px-3 py-1.5"
                        >
                          {Object.entries(statusInfo).map(([value, item]) => (
                            <option key={value} value={value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="rounded-full border border-brand-yellow px-5 py-1.5 font-semibold text-brand-yellow"
                        >
                          Forcer le statut
                        </button>
                      </form>

                      <form action={deleteOrder}>
                        <input
                          type="hidden"
                          name="orderId"
                          value={order.id}
                        />
                        <ConfirmButton
                          message="Supprimer définitivement cette commande ?"
                          className="rounded-full border border-red-400 px-5 py-1.5 font-semibold text-red-300 hover:bg-red-500/10"
                        >
                          Supprimer la commande
                        </ConfirmButton>
                      </form>
                    </div>
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
