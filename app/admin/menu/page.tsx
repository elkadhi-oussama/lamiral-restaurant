import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/menu";
import ConfirmButton from "@/components/ConfirmButton";
import DishFields from "@/app/admin/menu/DishFields";
import {
  createCategory,
  createDish,
  deleteCategory,
  deleteDish,
  setAvailable,
  updateCategory,
  updateDish,
} from "@/app/admin/menu/actions";

const inputClass =
  "rounded-lg border border-brand-yellow/30 bg-brand-brown px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-yellow";
const primaryButton =
  "rounded-full bg-brand-yellow px-5 py-2 text-sm font-semibold text-brand-brown hover:opacity-90";
const outlineButton =
  "rounded-full border border-brand-yellow px-5 py-2 text-sm font-semibold text-brand-yellow hover:bg-brand-yellow/10";
const dangerButton =
  "rounded-full border border-red-400 px-5 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10";

export default async function AdminMenuPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({
    orderBy: { position: "asc" },
    include: { dishes: { orderBy: { position: "asc" } } },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold italic text-brand-yellow">
        Menu
      </h1>

      <details className="mt-6 rounded-2xl border border-brand-yellow/20 bg-brand-brown-light p-5">
        <summary className="cursor-pointer font-semibold text-brand-yellow">
          + Ajouter une catégorie
        </summary>
        <form action={createCategory} className="mt-4 grid gap-3 sm:grid-cols-4">
          <input
            name="nameFr"
            required
            minLength={2}
            maxLength={60}
            placeholder="Nom (français)"
            className={inputClass}
          />
          <input
            name="nameEn"
            maxLength={60}
            placeholder="Name (English)"
            className={inputClass}
          />
          <input
            name="position"
            type="number"
            min={0}
            max={999}
            defaultValue={categories.length}
            className={inputClass}
          />
          <button type="submit" className={primaryButton}>
            Ajouter
          </button>
        </form>
      </details>

      {categories.map((category) => (
        <section key={category.id} className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold italic text-brand-yellow">
              {category.nameFr}{" "}
              <span className="text-sm not-italic text-brand-cream/60">
                ({category.dishes.length})
              </span>
            </h2>
            {category.dishes.length === 0 && (
              <form action={deleteCategory}>
                <input type="hidden" name="categoryId" value={category.id} />
                <ConfirmButton
                  message="Supprimer cette catégorie vide ?"
                  className={dangerButton}
                >
                  Supprimer la catégorie
                </ConfirmButton>
              </form>
            )}
          </div>

          <details className="mt-2 text-sm">
            <summary className="cursor-pointer text-brand-cream/60">
              Modifier la catégorie
            </summary>
            <form
              action={updateCategory}
              className="mt-3 grid gap-3 sm:grid-cols-4"
            >
              <input type="hidden" name="categoryId" value={category.id} />
              <input
                name="nameFr"
                required
                minLength={2}
                maxLength={60}
                defaultValue={category.nameFr}
                className={inputClass}
              />
              <input
                name="nameEn"
                maxLength={60}
                defaultValue={category.nameEn}
                className={inputClass}
              />
              <input
                name="position"
                type="number"
                min={0}
                max={999}
                defaultValue={category.position}
                className={inputClass}
              />
              <button type="submit" className={primaryButton}>
                Enregistrer
              </button>
            </form>
          </details>

          <ul className="mt-5 grid gap-4 md:grid-cols-2">
            {category.dishes.map((dish) => (
              <li
                key={dish.id}
                className="rounded-2xl border border-brand-yellow/20 bg-brand-brown-light p-4"
              >
                <div className="flex gap-4">
                  {dish.imageUrl ? (
                    <img
                      src={dish.imageUrl}
                      alt=""
                      className="h-20 w-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-brand-brown text-3xl">
                      {dish.emoji ?? "🍽️"}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{dish.nameFr}</p>
                    <p className="text-sm text-brand-yellow">
                      {formatPrice(dish.priceCents / 100, "fr")}
                    </p>
                    {!dish.available && (
                      <span className="mt-1 inline-block rounded-full bg-red-500/20 px-3 py-0.5 text-xs font-semibold text-red-300">
                        Masqué
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={setAvailable}>
                    <input type="hidden" name="dishId" value={dish.id} />
                    <input
                      type="hidden"
                      name="available"
                      value={dish.available ? "false" : "true"}
                    />
                    <button type="submit" className={outlineButton}>
                      {dish.available ? "Masquer" : "Afficher"}
                    </button>
                  </form>
                  <form action={deleteDish}>
                    <input type="hidden" name="dishId" value={dish.id} />
                    <ConfirmButton
                      message="Supprimer ce plat ? Les anciennes commandes gardent son nom et son prix."
                      className={dangerButton}
                    >
                      Supprimer
                    </ConfirmButton>
                  </form>
                </div>

                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer text-brand-cream/60">
                    Modifier
                  </summary>
                  <form action={updateDish} className="mt-3 space-y-3">
                    <input type="hidden" name="dishId" value={dish.id} />
                    <input type="hidden" name="categoryId" value={category.id} />
                    <DishFields
                      defaults={{
                        nameFr: dish.nameFr,
                        nameEn: dish.nameEn,
                        descriptionFr: dish.descriptionFr,
                        descriptionEn: dish.descriptionEn,
                        price: (dish.priceCents / 100).toFixed(2).replace(".", ","),
                        emoji: dish.emoji ?? "",
                        position: dish.position,
                        imageUrl: dish.imageUrl,
                      }}
                    />
                    <button type="submit" className={primaryButton}>
                      Enregistrer
                    </button>
                  </form>
                </details>
              </li>
            ))}
          </ul>

          <details className="mt-4 rounded-2xl border border-dashed border-brand-yellow/40 p-4">
            <summary className="cursor-pointer font-semibold text-brand-yellow">
              + Ajouter un plat dans « {category.nameFr} »
            </summary>
            <form action={createDish} className="mt-4 space-y-3">
              <input type="hidden" name="categoryId" value={category.id} />
              <DishFields />
              <button type="submit" className={primaryButton}>
                Ajouter le plat
              </button>
            </form>
          </details>
        </section>
      ))}
    </main>
  );
}