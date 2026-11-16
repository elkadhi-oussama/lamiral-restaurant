import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const image = await prisma.image.findUnique({ where: { id } });
  if (!image) return new Response("Not found", { status: 404 });

  // Profile pictures: only the owner and admins can see them
  if (image.kind === "AVATAR") {
    const user = await getCurrentUser();
    const allowed =
      user && (user.id === image.ownerId || user.role === "ADMIN");
    if (!allowed) return new Response("Not found", { status: 404 });
  }

  return new Response(image.data as BodyInit, {
    headers: {
      "Content-Type": image.mimeType,
      "X-Content-Type-Options": "nosniff",
      // a new picture always gets a new address, so dish pictures can be kept for long
      "Cache-Control":
        image.kind === "DISH"
          ? "public, max-age=31536000, immutable"
          : "private, max-age=3600",
    },
  });
}