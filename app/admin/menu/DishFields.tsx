import ImageField from "@/components/ImageField";

export type DishDefaults = {
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
  price: string;
  emoji: string;
  position: number;
  imageUrl: string | null;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-brand-yellow/30 bg-brand-brown px-3 py-2 text-sm text-brand-cream outline-none focus:border-brand-yellow";

export default function DishFields({ defaults }: { defaults?: DishDefaults }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm">
        Nom (français)
        <input
          name="nameFr"
          required
          minLength={2}
          maxLength={80}
          defaultValue={defaults?.nameFr}
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        Name (English, optionnel)
        <input
          name="nameEn"
          maxLength={80}
          defaultValue={defaults?.nameEn}
          className={inputClass}
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        Description (français)
        <textarea
          name="descriptionFr"
          required
          minLength={2}
          maxLength={300}
          rows={2}
          defaultValue={defaults?.descriptionFr}
          className={inputClass}
        />
      </label>
      <label className="block text-sm sm:col-span-2">
        Description (English, optionnel)
        <textarea
          name="descriptionEn"
          maxLength={300}
          rows={2}
          defaultValue={defaults?.descriptionEn}
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        Prix en euros
        <input
          name="price"
          required
          inputMode="decimal"
          placeholder="14,50"
          pattern="[0-9]+([.,][0-9]{1,2})?"
          defaultValue={defaults?.price}
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        Ordre d&apos;affichage
        <input
          name="position"
          type="number"
          min={0}
          max={999}
          defaultValue={defaults?.position ?? 0}
          className={inputClass}
        />
      </label>
      <label className="block text-sm">
        Emoji (utilisé s&apos;il n&apos;y a pas de photo)
        <input
          name="emoji"
          maxLength={8}
          defaultValue={defaults?.emoji}
          className={inputClass}
        />
      </label>
      <div className="sm:col-span-2">
        <ImageField
          name="image"
          label="Photo du plat"
          buttonText="Choisir une photo"
          errorText="Impossible de lire cette image."
          maxSize={900}
          currentUrl={defaults?.imageUrl}
        />
        {defaults?.imageUrl && (
          <label className="mt-2 flex items-center gap-2 text-sm text-brand-cream/80">
            <input type="checkbox" name="removeImage" />
            Supprimer la photo actuelle
          </label>
        )}
      </div>
    </div>
  );
}