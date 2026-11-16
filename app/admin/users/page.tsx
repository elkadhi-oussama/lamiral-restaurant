
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { decryptField } from "@/lib/crypto";
import { formatPhone } from "@/lib/phone";
import { readAddress } from "@/lib/profile";
import ConfirmButton from "@/components/ConfirmButton";
import {
  deleteUser,
  setRestricted,
  updateUser,
} from "@/app/admin/users/actions";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const admin = await requireAdmin();
  const { q } = await searchParams;
  const search = (q ?? "").trim().slice(0, 80);

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {},
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { _count: { select: { orders: true } } },
  });

  const dateFormat = new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeZone: "Europe/Paris",
  });

  const inputClass =
    "rounded-lg border border-brand-yellow/30 bg-brand-brown px-3 py-1.5 text-sm text-brand-cream outline-none focus:border-brand-yellow";

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold italic text-brand-yellow">
          Clients ({users.length})
        </h1>

        <form className="flex gap-2">
          <input
            name="q"
            defaultValue={search}
            placeholder="Nom ou e-mail"
            className={inputClass}
          />

          <button
            type="submit"
            className="rounded-full bg-brand-yellow px-5 py-1.5 text-sm font-semibold text-brand-brown"
          >
            Chercher
          </button>
        </form>
      </div>

      <ul className="mt-8 space-y-4">
        {users.map((user) => {
          const phone = user.phone ? decryptField(user.phone) : null;
          const address = readAddress(user.address);
          const isSelf = user.id === admin.id;

          return (
            <li
              key={user.id}
              className="rounded-2xl border border-brand-yellow/20 bg-brand-brown-light p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">
                    {user.name}
                    {isSelf && (
                      <span className="ml-2 text-xs text-brand-cream/60">
                        (vous)
                      </span>
                    )}
                  </p>

                  <p className="text-sm text-brand-cream/80">
                    {user.email}
                  </p>

                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="text-sm text-brand-yellow underline"
                    >
                      📞 {formatPhone(phone)}
                    </a>
                  )}

                  {address && (
                    <p className="text-sm text-brand-cream/80">
                      🏠 {address.street}, {address.postalCode} {address.city}
                      {address.extra ? ` (${address.extra})` : ""}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-brand-cream/60">
                    Inscrit le {dateFormat.format(user.createdAt)} ·{" "}
                    {user._count.orders} commande(s)
                  </p>
                </div>

                <div className="flex gap-2 text-xs font-semibold">
                  <span
                    className={`rounded-full px-3 py-1 ${
                      user.role === "ADMIN"
                        ? "bg-brand-yellow text-brand-brown"
                        : "bg-brand-cream/10 text-brand-cream/70"
                    }`}
                  >
                    {user.role === "ADMIN" ? "Administrateur" : "Client"}
                  </span>

                  {user.restricted && (
                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-red-300">
                      Restreint
                    </span>
                  )}
                </div>
              </div>

              {!isSelf && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <form action={setRestricted}>
                    <input type="hidden" name="userId" value={user.id} />
                    <input
                      type="hidden"
                      name="restricted"
                      value={user.restricted ? "false" : "true"}
                    />

                    <ConfirmButton
                      message={
                        user.restricted
                          ? "Réactiver ce compte ?"
                          : "Restreindre ce compte ? Le client ne pourra plus se connecter ni commander."
                      }
                      className="rounded-full border border-brand-yellow px-5 py-2 text-sm font-semibold text-brand-yellow hover:bg-brand-yellow/10"
                    >
                      {user.restricted ? "Réactiver" : "Restreindre"}
                    </ConfirmButton>
                  </form>

                  <form action={deleteUser}>
                    <input type="hidden" name="userId" value={user.id} />

                    <ConfirmButton
                      message="Supprimer définitivement ce compte ? Les commandes passées sont conservées mais anonymisées. Cette action est irréversible."
                      className="rounded-full border border-red-400 px-5 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
                    >
                      Supprimer
                    </ConfirmButton>
                  </form>
                </div>
              )}

              <details className="mt-4 text-sm">
                <summary className="cursor-pointer text-brand-cream/60">
                  Modifier
                </summary>

                <form
                  action={updateUser}
                  className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
                >
                  <input type="hidden" name="userId" value={user.id} />

                  <input
                    name="name"
                    defaultValue={user.name}
                    required
                    minLength={2}
                    maxLength={80}
                    className={inputClass}
                  />

                  <input
                    name="phone"
                    defaultValue={phone ?? ""}
                    placeholder="06 12 34 56 78"
                    className={inputClass}
                  />

                  <select
                    name="role"
                    defaultValue={user.role}
                    disabled={isSelf}
                    className={inputClass}
                  >
                    <option value="CUSTOMER">Client</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>

                  <button
                    type="submit"
                    className="rounded-full bg-brand-yellow px-5 py-1.5 font-semibold text-brand-brown"
                  >
                    Enregistrer
                  </button>
                </form>
              </details>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
