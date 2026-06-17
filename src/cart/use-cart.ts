"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { Currency } from "@/lib/money";
import * as ops from "./cart";
import { emptyCart, parseCart, type Cart } from "./cart";

const STORAGE_KEY = "cart";

const listeners = new Set<() => void>();
let snapshot: { raw: string | null; cart: Cart } | undefined;

function read(): Cart {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (snapshot?.raw !== raw) {
    snapshot = { raw, cart: parseCart(raw) };
  }
  return snapshot.cart;
}

function write(cart: Cart) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function useCart() {
  const cart = useSyncExternalStore(subscribe, read, () => emptyCart);

  const update = useCallback((change: (cart: Cart) => Cart) => write(change(read())), []);

  return {
    cart,
    add: useCallback((productId: string) => update((c) => ops.addItem(c, productId)), [update]),
    remove: useCallback(
      (productId: string) => update((c) => ops.removeItem(c, productId)),
      [update],
    ),
    setQuantity: useCallback(
      (productId: string, quantity: number) =>
        update((c) => ops.setQuantity(c, productId, quantity)),
      [update],
    ),
    setCurrency: useCallback(
      (currency: Currency) => update((c) => ops.setCurrency(c, currency)),
      [update],
    ),
    clear: useCallback(() => update((c) => ({ ...c, items: [] })), [update]),
  };
}
