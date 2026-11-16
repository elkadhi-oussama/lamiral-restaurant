import { decryptField } from "@/lib/crypto";

export type Address = {
  street: string;
  postalCode: string;
  city: string;
  extra: string;
};

export function readAddress(stored: string | null): Address | null {
  if (!stored) return null;
  const plain = decryptField(stored);
  if (!plain) return null;
  try {
    const value = JSON.parse(plain) as Partial<Address>;
    return {
      street: value.street ?? "",
      postalCode: value.postalCode ?? "",
      city: value.city ?? "",
      extra: value.extra ?? "",
    };
  } catch {
    return null;
  }
}