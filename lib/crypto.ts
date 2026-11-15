import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "v1:";

function getKey(): Buffer {
  const hex = process.env.DATA_ENCRYPTION_KEY;
  if (!hex || !/^[0-9a-f]{64}$/i.test(hex)) {
    throw new Error("DATA_ENCRYPTION_KEY must be 64 hexadecimal characters");
  }
  return Buffer.from(hex, "hex");
}

export function isEncrypted(value: string): boolean {
  return value.startsWith(PREFIX);
}

export function encryptField(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const data = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("base64")}:${tag.toString("base64")}:${data.toString("base64")}`;
}

// Returns null if the value cannot be decrypted (wrong key or damaged data)
export function decryptField(stored: string): string | null {
  if (!isEncrypted(stored)) return stored; // old plain value, kept readable until migrated
  try {
    const [iv, tag, data] = stored.slice(PREFIX.length).split(":");
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(iv, "base64"),
    );
    decipher.setAuthTag(Buffer.from(tag, "base64"));
    return Buffer.concat([
      decipher.update(Buffer.from(data, "base64")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    console.error("Could not decrypt a stored field");
    return null;
  }
}