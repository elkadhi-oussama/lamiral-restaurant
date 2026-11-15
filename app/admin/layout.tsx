import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/lib/auth-actions";
import { requireAdmin } from "@/lib/admin";

export const metadata: Metadata = {
  title: "Administration · L'Amiral",
  robots: { index: false, follow: false },
};

const tabs = [
  { href: "/admin", label: "Commandes" },
  { href: "/admin/users", label: "Clients" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-brand-yellow/20 bg-brand-brown-light">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link
            href="/admin"
            className="font-[family-name:var(--font-display)] text-xl font-bold italic text-brand-yellow"
          >
            ⚓ L&apos;Amiral · Administration
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-brand-cream/70 sm:inline">
              {user.name}
            </span>
            <Link href="/fr" className="text-brand-cream/80 hover:text-brand-yellow">
              Voir le site
            </Link>
            <form action={logout.bind(null, "fr")}>
              <button
                type="submit"
                className="text-brand-cream/80 hover:text-brand-yellow"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-6 px-6 pb-3 text-sm uppercase tracking-widest">
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="text-brand-cream/80 hover:text-brand-yellow"
            >
              {tab.label}
            </Link>
          ))}
        </nav>
      </header>
      {children}
    </div>
  );
}