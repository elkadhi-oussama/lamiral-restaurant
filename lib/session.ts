import { cache } from "react";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "lamiral-session";
const DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET is missing or too short");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + DURATION_MS);
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function deleteSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// Current logged-in user, read from the database (so a changed role applies immediately)
export const getCurrentUser = cache(async () => {
  const key = getKey();
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string") return null;

    return await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });
  } catch {
    return null;
  }
});