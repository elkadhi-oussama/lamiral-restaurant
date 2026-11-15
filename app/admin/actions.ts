"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { transitions } from "@/lib/order-status";

const schema = z.object({
  orderId: z.string().min(1).max(60),
  status: z.enum([
    "ACCEPTED",
    "REJECTED",
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED",
  ]),
});

export async function updateOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin(); // checked here too: actions can be called directly

  const parsed = schema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;
  const { orderId, status } = parsed.data;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true },
  });
  if (!order || !(transitions[order.status] ?? []).includes(status)) return;

  // Only updates if the status is still the one we just checked
  await prisma.order.updateMany({
    where: { id: orderId, status: order.status },
    data: { status },
  });

  revalidatePath("/admin");
}

const anyStatus = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "PREPARING",
  "READY",
  "COMPLETED",
  "CANCELLED",
]);

// Admin override: any status, ignoring the normal workflow
export async function forceOrderStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = z
    .object({ orderId: z.string().min(1).max(60), status: anyStatus })
    .safeParse({
      orderId: formData.get("orderId"),
      status: formData.get("status"),
    });
  if (!parsed.success) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { status: parsed.data.status },
  });
  revalidatePath("/admin");
}

export async function updateOrderDetails(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = z
    .object({
      orderId: z.string().min(1).max(60),
      pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
      note: z.string().trim().max(300),
    })
    .safeParse({
      orderId: formData.get("orderId"),
      pickupTime: formData.get("pickupTime"),
      note: String(formData.get("note") ?? ""),
    });
  if (!parsed.success) return;

  await prisma.order.update({
    where: { id: parsed.data.orderId },
    data: { pickupTime: parsed.data.pickupTime, note: parsed.data.note || null },
  });
  revalidatePath("/admin");
}

export async function deleteOrder(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = z.string().min(1).max(60).safeParse(formData.get("orderId"));
  if (!id.success) return;

  await prisma.order.delete({ where: { id: id.data } }); // items are deleted with it
  revalidatePath("/admin");
}