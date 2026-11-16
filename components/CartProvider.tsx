"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type { Dish } from "@/lib/menu";

type CartLine = { id: string; qty: number };

const STORAGE_KEY = "lamiral-cart";
const MAX_QTY = 20;
const EMPTY: CartLine[] = [];

// --- Small store saved in the browser (localStorage) ---

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
        Number.isInteger(line?.qty) &&
        line.qty > 0,
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
    // storage not available: keep the cart in memory
  }
  return cache;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
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
    // ignore
  }
  listeners.forEach((listener) => listener());
}

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

// --- The dishes come from the database (given by the layout) ---

const DishesContext = createContext<Dish[]>([]);

export function CartProvider({
  children,
  dishes,
}: {
  children: React.ReactNode;
  dishes: Dish[];
}) {
  return (
    <DishesContext.Provider value={dishes}>{children}</DishesContext.Provider>
  );
}

export function useCart() {
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const dishes = useContext(DishesContext);

  return useMemo(() => {
    const byId = new Map(dishes.map((dish) => [dish.id, dish]));
    // a dish that was hidden or deleted disappears from the cart
    const lines = stored.filter((line) => byId.has(line.id));
    const count = lines.reduce((sum, line) => sum + line.qty, 0);
    const total = lines.reduce(
      (sum, line) => sum + (byId.get(line.id)?.price ?? 0) * line.qty,
      0,
    );
    const find = (id: string) => byId.get(id);
    return { lines, count, total, find, add, setQty, remove, clear };
  }, [stored, dishes]);
}