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