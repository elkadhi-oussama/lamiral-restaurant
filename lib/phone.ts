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