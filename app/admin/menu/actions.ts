"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { deleteImageByUrl, saveImage } from "@/lib/images";

const idSchema = z.string().min(1).max(60);
const text = (formData: FormData, key: string) =>
  String(formData.get(key) ?? "");

function slugify(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "item"
  );
}

// "14,5" or "14.50" -> 1450 (cents). Returns null if the price is not valid.
function parsePriceCents(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  if (!/^\d{1,4}(\.\d{1,2})?$/.test(normalized)) return null;
  const cents = Math.round(Number(normalized) * 100);
  return cents > 0 ? cents : null;
}

const isUniqueError = (error: unknown) =>
  (error as { code?: string }).code === "P2002";

function slugCandidate(base: string, attempt: number) {
  return attempt === 0
    ? base
    : `${base}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/* ---------------- Categories ---------------- */

const categorySchema = z.object({
  nameFr: z.string().trim().min(2).max(60),
  nameEn: z.string().trim().max(60),
  position: z.coerce.number().int().min(0).max(999),
});

function readCategory(formData: FormData) {
  return categorySchema.safeParse({
    nameFr: text(formData, "nameFr"),
    nameEn: text(formData, "nameEn"),
    position: text(formData, "position") || "0",
  });
}

export async function createCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = readCategory(formData);
  if (!parsed.success) return;
  const { nameFr, nameEn, position } = parsed.data;
  const base = slugify(nameFr);

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.category.create({
        data: {
          slug: slugCandidate(base, attempt),
          nameFr,
          nameEn: nameEn || nameFr,
          position,
        },
      });
      break;
    } catch (error) {
      if (!isUniqueError(error)) return;
    }
  }
  revalidatePath("/admin/menu");
}

export async function updateCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("categoryId"));
  const parsed = readCategory(formData);
  if (!id.success || !parsed.success) return;
  const { nameFr, nameEn, position } = parsed.data;

  await prisma.category.update({
    where: { id: id.data },
    data: { nameFr, nameEn: nameEn || nameFr, position },
  });
  revalidatePath("/admin/menu");
}

// Only an empty category can be deleted
export async function deleteCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("categoryId"));
  if (!id.success) return;

  const dishes = await prisma.dish.count({ where: { categoryId: id.data } });
  if (dishes > 0) return;

  await prisma.category.delete({ where: { id: id.data } });
  revalidatePath("/admin/menu");
}

/* ---------------- Dishes ---------------- */

const dishSchema = z.object({
  categoryId: idSchema,
  nameFr: z.string().trim().min(2).max(80),
  nameEn: z.string().trim().max(80),
  descriptionFr: z.string().trim().min(2).max(300),
  descriptionEn: z.string().trim().max(300),
  priceCents: z.number().int().min(1).max(100000),
  emoji: z.string().trim().max(8),
  position: z.coerce.number().int().min(0).max(999),
});

function readDish(formData: FormData) {
  return dishSchema.safeParse({
    categoryId: text(formData, "categoryId"),
    nameFr: text(formData, "nameFr"),
    nameEn: text(formData, "nameEn"),
    descriptionFr: text(formData, "descriptionFr"),
    descriptionEn: text(formData, "descriptionEn"),
    priceCents: parsePriceCents(text(formData, "price")),
    emoji: text(formData, "emoji"),
    position: text(formData, "position") || "0",
  });
}

export async function createDish(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = readDish(formData);
  if (!parsed.success) return;
  const d = parsed.data;

  const category = await prisma.category.findUnique({
    where: { id: d.categoryId },
    select: { id: true },
  });
  if (!category) return;

  let imageUrl: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const saved = await saveImage(file, "DISH", null);
    if (!saved.ok) return;
    imageUrl = saved.url;
  }

  const base = slugify(d.nameFr);
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.dish.create({
        data: {
          slug: slugCandidate(base, attempt),
          categoryId: d.categoryId,
          nameFr: d.nameFr,
          nameEn: d.nameEn || d.nameFr,
          descriptionFr: d.descriptionFr,
          descriptionEn: d.descriptionEn || d.descriptionFr,
          priceCents: d.priceCents,
          emoji: d.emoji || null,
          imageUrl,
          position: d.position,
        },
      });
      revalidatePath("/admin/menu");
      return;
    } catch (error) {
      if (!isUniqueError(error)) break;
    }
  }
  await deleteImageByUrl(imageUrl); // the dish was not created: remove the photo
}

export async function updateDish(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("dishId"));
  const parsed = readDish(formData);
  if (!id.success || !parsed.success) return;
  const d = parsed.data;

  const current = await prisma.dish.findUnique({
    where: { id: id.data },
    select: { imageUrl: true },
  });
  if (!current) return;

  // undefined = keep the current photo
  let imageUrl: string | null | undefined;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const saved = await saveImage(file, "DISH", null);
    if (!saved.ok) return;
    imageUrl = saved.url;
  } else if (formData.get("removeImage") === "on") {
    imageUrl = null;
  }

  await prisma.dish.update({
    where: { id: id.data },
    data: {
      categoryId: d.categoryId,
      nameFr: d.nameFr,
      nameEn: d.nameEn || d.nameFr,
      descriptionFr: d.descriptionFr,
      descriptionEn: d.descriptionEn || d.descriptionFr,
      priceCents: d.priceCents,
      emoji: d.emoji || null,
      position: d.position,
      ...(imageUrl !== undefined ? { imageUrl } : {}),
    },
  });
  if (imageUrl !== undefined) await deleteImageByUrl(current.imageUrl);
  revalidatePath("/admin/menu");
}

export async function setAvailable(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("dishId"));
  if (!id.success) return;

  await prisma.dish.update({
    where: { id: id.data },
    data: { available: formData.get("available") === "true" },
  });
  revalidatePath("/admin/menu");
}

// Old orders keep the dish name and price (they are saved inside the order)
export async function deleteDish(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = idSchema.safeParse(formData.get("dishId"));
  if (!id.success) return;

  const dish = await prisma.dish.findUnique({
    where: { id: id.data },
    select: { imageUrl: true },
  });
  if (!dish) return;

  await prisma.dish.delete({ where: { id: id.data } });
  await deleteImageByUrl(dish.imageUrl);
  revalidatePath("/admin/menu");
}