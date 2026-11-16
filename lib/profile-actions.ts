"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { encryptField } from "@/lib/crypto";
import { frenchPhoneSchema } from "@/lib/phone";
import { deleteImageByUrl, saveImage } from "@/lib/images";
import { profileText } from "@/lib/profile-text";

const schema = z
  .object({
    name: z.string().trim().min(2).max(80),
    phone: frenchPhoneSchema,
    street: z.string().trim().max(120),
    postalCode: z.string().trim().max(10),
    city: z.string().trim().max(80),
    extra: z.string().trim().max(120),
  })
  .refine((a) => {
    const filled = [a.street, a.postalCode, a.city].filter(Boolean).length;
    // either no address at all, or a complete one
    return filled === 0 || (filled === 3 && /^\d{5}$/.test(a.postalCode));
  });

export async function updateProfile(locale: string, formData: FormData) {
  const language = locale === "en" ? "en" : "fr";
  const t = profileText[language];

  const user = await getCurrentUser();
  if (!user) redirect(`/${language}/login`);

  const text = (key: string) => String(formData.get(key) ?? "");
  const parsed = schema.safeParse({
    name: text("name"),
    phone: text("phone"),
    street: text("street"),
    postalCode: text("postalCode"),
    city: text("city"),
    extra: text("extra"),
  });
  if (!parsed.success) return { error: t.invalid };
  const { name, phone, street, postalCode, city, extra } = parsed.data;

  // undefined = keep the current picture
  let avatarUrl: string | null | undefined;
  const file = formData.get("avatar");
  if (file instanceof File && file.size > 0) {
    const saved = await saveImage(file, "AVATAR", user.id);
    if (!saved.ok) {
      return { error: saved.error === "too_big" ? t.imageTooBig : t.imageBadType };
    }
    avatarUrl = saved.url;
  } else if (formData.get("removeAvatar") === "on") {
    avatarUrl = null;
  }

  const address = street
    ? encryptField(JSON.stringify({ street, postalCode, city, extra }))
    : null;

  try {
    const previous = await prisma.user.findUnique({
      where: { id: user.id },
      select: { avatarUrl: true },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone: encryptField(phone),
        address,
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      },
    });
    if (avatarUrl !== undefined) await deleteImageByUrl(previous?.avatarUrl);
  } catch {
    return { error: t.failed };
  }

  revalidatePath(`/${language}/account`);
  redirect(`/${language}/account`);
}