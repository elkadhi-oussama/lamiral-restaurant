"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { frenchPhoneSchema } from "@/lib/phone";
import { createSession, deleteSession } from "@/lib/session";
import { authText } from "@/lib/auth-text";
import { encryptField } from "@/lib/crypto"

type Lang = "fr" | "en";
const toLang = (locale: string): Lang => (locale === "en" ? "en" : "fr");

// Keeps login timing similar when the e-mail does not exist
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

// Only two safe destinations: no open redirects
function destination(language: Lang, next?: string) {
  if (next === "checkout") return `/${language}/checkout`;
  if (next === "admin") return "/admin";
  return `/${language}`;
}

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(120),
  phone: frenchPhoneSchema,
  password: z.string().min(10).max(72),
  next: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(1).max(200),
  next: z.string().optional(),
});

export async function register(locale: string, input: unknown) {
  const language = toLang(locale);
  const t = authText[language];

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: t.invalid };
  const { name, email, phone, password, next } = parsed.data;

  const passwordHash = await bcrypt.hash(password, 12);

  let userId: string;
  try {
    // The role is never read from the form: new accounts are always CUSTOMER
    const user = await prisma.user.create({
      data: { name, email, phone: encryptField(phone), passwordHash },
    });
    userId = user.id;
  } catch (error) {
    if ((error as { code?: string }).code === "P2002") {
      return { error: t.emailTaken };
    }
    return { error: t.failed };
  }

  await createSession(userId);
  redirect(destination(language, next));
}

export async function login(locale: string, input: unknown) {
  const language = toLang(locale);
  const t = authText[language];

  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: t.invalid };
  const { email, password, next } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) return { error: t.wrongCreds };

  await createSession(user.id);
  redirect(destination(language, next));
}

export async function logout(locale: string) {
  await deleteSession();
  redirect(`/${toLang(locale)}`);
}