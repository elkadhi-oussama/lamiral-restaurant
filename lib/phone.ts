import { z } from "zod";

export function normalizeFrenchPhone(value: string): string | null {
  const compact = value.replace(/[\s.\-]/g, "");
  const match = compact.match(/^(?:(?:\+|00)33|0)([1-9]\d{8})$/);
  return match ? `0${match[1]}` : null;
}

export const frenchPhoneSchema = z
  .string()
  .trim()
  .refine((value) => normalizeFrenchPhone(value) !== null)
  .transform((value) => normalizeFrenchPhone(value) as string);

// "0612345678" -> "06 12 34 56 78"
export function formatPhone(national: string): string {
  return /^0\d{9}$/.test(national)
    ? national.replace(/(\d{2})(?=\d)/g, "$1 ")
    : national;
}