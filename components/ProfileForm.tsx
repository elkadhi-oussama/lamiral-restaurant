"use client";

import { useState } from "react";
import ImageField from "@/components/ImageField";
import { updateProfile } from "@/lib/profile-actions";
import type { Locale } from "@/lib/dictionaries";
import { profileText } from "@/lib/profile-text";

type Defaults = {
  name: string;
  phone: string;
  street: string;
  postalCode: string;
  city: string;
  extra: string;
  avatarUrl: string | null;
};

export default function ProfileForm({
  locale,
  defaults,
}: {
  locale: Locale;
  defaults: Defaults;
}) {
  const t = profileText[locale];
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-lg border border-brand-yellow/30 bg-brand-brown px-4 py-2.5 text-brand-cream outline-none focus:border-brand-yellow";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);

    setPending(true);
    setError(null);
    try {
      const result = await updateProfile(locale, data);
      if (result?.error) setError(result.error);
    } catch {
      setError(t.failed);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <ImageField
        name="avatar"
        label={t.avatar}
        buttonText={t.chooseImage}
        errorText={t.imageError}
        maxSize={256}
        currentUrl={defaults.avatarUrl}
        round
      />
      {defaults.avatarUrl && (
        <label className="flex items-center gap-2 text-sm text-brand-cream/80">
          <input type="checkbox" name="removeAvatar" />
          {t.removeAvatar}
        </label>
      )}

      <label className="block text-sm">
        {t.name}
        <input
          name="name"
          required
          minLength={2}
          maxLength={80}
          defaultValue={defaults.name}
          autoComplete="name"
          className={inputClass}
        />
      </label>

      <label className="block text-sm">
        {t.phone}
        <input
          name="phone"
          type="tel"
          inputMode="tel"
          required
          defaultValue={defaults.phone}
          placeholder="06 12 34 56 78"
          pattern="(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]*\d{2}){4}"
          autoComplete="tel"
          className={inputClass}
        />
      </label>

      <p className="pt-2 text-sm font-semibold text-brand-yellow">
        {t.addressTitle}
      </p>
      <label className="block text-sm">
        {t.street}
        <input
          name="street"
          maxLength={120}
          defaultValue={defaults.street}
          autoComplete="street-address"
          className={inputClass}
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          {t.postalCode}
          <input
            name="postalCode"
            inputMode="numeric"
            maxLength={5}
            defaultValue={defaults.postalCode}
            autoComplete="postal-code"
            className={inputClass}
          />
        </label>
        <label className="block text-sm">
          {t.city}
          <input
            name="city"
            maxLength={80}
            defaultValue={defaults.city}
            autoComplete="address-level2"
            className={inputClass}
          />
        </label>
      </div>
      <label className="block text-sm">
        {t.extra}
        <input
          name="extra"
          maxLength={120}
          defaultValue={defaults.extra}
          className={inputClass}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-brand-yellow py-3 font-semibold text-brand-brown transition hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "…" : t.save}
      </button>
    </form>
  );
}