"use client";

import { useState } from "react";
import { login, register } from "@/lib/auth-actions";
import type { Locale } from "@/lib/dictionaries";
import { authText } from "@/lib/auth-text";

export default function AuthForm({
  locale,
  mode,
  next,
}: {
  locale: Locale;
  mode: "login" | "register";
  next?: string;
}) {
  const t = authText[locale];
  const isRegister = mode === "register";
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const inputClass =
    "mt-1 w-full rounded-lg border border-brand-yellow/30 bg-brand-brown px-4 py-2.5 text-brand-cream outline-none focus:border-brand-yellow";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);
    try {
      const result = isRegister
        ? await register(locale, {
            name: String(form.get("name") ?? ""),
            email,
            phone: String(form.get("phone") ?? ""),
            password,
            next,
          })
        : await login(locale, { email, password, next });

      if (result?.error) setError(result.error);
    } catch {
      setError(t.failed);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5 text-left">
      {isRegister && (
        <label className="block text-sm">
          {t.name}
          <input
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className={inputClass}
          />
        </label>
      )}

      <label className="block text-sm">
        {t.email}
        <input
          name="email"
          type="email"
          required
          maxLength={120}
          autoComplete="email"
          className={inputClass}
        />
      </label>

      {isRegister && (
        <label className="block text-sm">
          {t.phone}
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            required
            placeholder="06 12 34 56 78"
            pattern="(?:(?:\+|00)33|0)\s*[1-9](?:[\s.\-]*\d{2}){4}"
            autoComplete="tel"
            className={inputClass}
          />
        </label>
      )}

      <label className="block text-sm">
        {t.password}
        <input
          name="password"
          type="password"
          required
          minLength={isRegister ? 10 : 1}
          maxLength={72}
          autoComplete={isRegister ? "new-password" : "current-password"}
          className={inputClass}
        />
        {isRegister && (
          <span className="mt-1 block text-xs text-brand-cream/60">
            {t.passwordHint}
          </span>
        )}
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
        {pending ? "…" : isRegister ? t.submitRegister : t.submitLogin}
      </button>
    </form>
  );
}