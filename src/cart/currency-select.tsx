"use client";

import { currencies, isCurrency } from "@/lib/money";
import { useCart } from "./use-cart";

export function CurrencySelect() {
  const { cart, setCurrency } = useCart();

  return (
    <select
      aria-label="Currency"
      value={cart.currency}
      onChange={(event) => {
        if (isCurrency(event.target.value)) setCurrency(event.target.value);
      }}
      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm"
    >
      {currencies.map((currency) => (
        <option key={currency} value={currency}>
          {currency}
        </option>
      ))}
    </select>
  );
}
