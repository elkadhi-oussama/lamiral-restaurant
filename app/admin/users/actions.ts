"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { encryptField } from "@/lib/crypto";
import { frenchPhoneSchema } from "@/lib/phone";

const idSchema = z.string().min(1).max(60);

// Block or unblock an account (you cannot do it to yourself)
export async function setRestricted(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(formData.get("userId"));
  if (!id.success || id.data === admin.id) return;

  await prisma.user.update({
    where: { id: id.data },
    data: { restricted: formData.get("restricted") === "true" },
  });
  revalidatePath("/admin/users");
}

const updateSchema = z.object({
  userId: idSchema,
  name: z.string().trim().min(2).max(80),
  phone: z.union([z.literal(""), frenchPhoneSchema]),
  role: z.enum(["CUSTOMER", "ADMIN"]),
});

export async function updateUser(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const parsed = updateSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    phone: String(formData.get("phone") ?? "").trim(),
    role: formData.get("role"),
  });
  if (!parsed.success) return;
  const { userId, name, phone, role } = parsed.data;

  await prisma.user.update({
    where: { id: userId },
    data: {
      name,
      phone: phone ? encryptField(phone) : null,
      // you cannot change your own role: there is always at least one admin
      ...(userId === admin.id ? {} : { role }),
    },
  });
  revalidatePath("/admin/users");
}

// Deletes the account. Past orders are kept for the restaurant's records,
// but the customer's personal data on them is erased.
export async function deleteUser(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = idSchema.safeParse(formData.get("userId"));
  if (!id.success || id.data === admin.id) return;

  await prisma.$transaction([
    prisma.order.updateMany({
      where: { userId: id.data },
      data: { customerName: "Client supprimé", customerPhone: "", note: null },
    }),
    prisma.user.delete({ where: { id: id.data } }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath("/admin");
}