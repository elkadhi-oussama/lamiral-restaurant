"use client";

import { useMemo, useSyncExternalStore } from "react";
import { findDish } from "@/lib/menu";

type CartLine = { id: string; qty: number };

const STORAGE_KEY = "lamiral-cart";
const MAX_QTY = 20;
const EMPTY: CartLine[] = [];

// --- Tiny store backed by localStorage ---------------------------------

let cache: CartLine[] = EMPTY;
let cacheRaw: string | null = null;
const listeners = new Set<() => void>();

function parse(raw: string | null): CartLine[] {
  if (!raw) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(
      (line): line is CartLine =>
        typeof line?.id === "string" &&
        typeof line?.qty === "number" &&
        line.qty > 0 &&
        findDish(line.id) !== undefined,
    );
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== cacheRaw) {
      cacheRaw = raw;
      cache = parse(raw);
    }
  } catch {
    // storage unavailable: keep the in-memory cart
  }
  return cache;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback); // other browser tabs
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function write(next: CartLine[]) {
  cache = next;
  try {
    const raw = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY, raw);
    cacheRaw = raw;
  } catch {
    // storage unavailable: cart still works until the page is closed
  }
  listeners.forEach((listener) => listener());
}

// --- Cart actions -------------------------------------------------------

function add(id: string) {
  const current = getSnapshot();
  const existing = current.find((line) => line.id === id);
  write(
    existing
      ? current.map((line) =>
          line.id === id
            ? { ...line, qty: Math.min(line.qty + 1, MAX_QTY) }
            : line,
        )
      : [...current, { id, qty: 1 }],
  );
}

function setQty(id: string, qty: number) {
  const current = getSnapshot();
  write(
    qty <= 0
      ? current.filter((line) => line.id !== id)
      : current.map((line) =>
          line.id === id ? { ...line, qty: Math.min(qty, MAX_QTY) } : line,
        ),
  );
}

function remove(id: string) {
  write(getSnapshot().filter((line) => line.id !== id));
}

function clear() {
  write(EMPTY);
}

// --- Public API (same as before) ----------------------------------------

export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useCart() {
  const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return useMemo(() => {
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const total = lines.reduce(
      (sum, line) => sum + (findDish(line.id)?.price ?? 0) * line.qty,
      0,
    );
    return { lines, count, total, add, setQty, remove, clear };
  }, [lines]);
}