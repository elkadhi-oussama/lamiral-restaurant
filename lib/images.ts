import { prisma } from "@/lib/prisma";

const MAX_BYTES = 400 * 1024;

// We check the real file content, not the file name or the type sent by the browser
function detectType(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length > 12 &&
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export type SaveImageResult =
  | { ok: true; url: string }
  | { ok: false; error: "too_big" | "bad_type" };

export async function saveImage(
  file: File,
  kind: "AVATAR" | "DISH",
  ownerId: string | null,
): Promise<SaveImageResult> {
  if (file.size === 0 || file.size > MAX_BYTES) {
    return { ok: false, error: "too_big" };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectType(bytes);
  if (!mimeType) return { ok: false, error: "bad_type" };

  const image = await prisma.image.create({
    data: { kind, ownerId, mimeType, data: bytes },
  });
  return { ok: true, url: `/img/${image.id}` };
}

export async function deleteImageByUrl(url: string | null | undefined) {
  const match = url?.match(/^\/img\/([a-z0-9]+)$/);
  if (!match) return;
  await prisma.image.deleteMany({ where: { id: match[1] } });
}