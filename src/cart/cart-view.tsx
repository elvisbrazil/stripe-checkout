"use client";

import Link from "next/link";
import { formatMoney } from "@/lib/money";
import { MAX_QUANTITY, cartLines, cartTotal } from "./cart";
import { CheckoutButton } from "./checkout-button";
import { useCart } from "./use-cart";

export function CartView() {
  const { cart, setQuantity, remove } = useCart();
  const lines = cartLines(cart);

  if (lines.length === 0) {
    return (
      <p className="text-neutral-600">
        Your cart is empty.{" "}
        <Link href="/" className="underline">
          Browse products
        </Link>
      </p>
    );
  }

  return (
    <div>
      <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {lines.map(({ product, quantity, total }) => (
          <li key={product.id} className="flex items-center gap-4 p-4">
            <span className="flex-1 font-medium">{product.name}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Decrease ${product.name}`}
                onClick={() => setQuantity(product.id, quantity - 1)}
                className="h-7 w-7 rounded border border-neutral-300"
              >
                -
              </button>
              <span aria-label={`${product.name} quantity`} className="w-6 text-center">
                {quantity}
              </span>
              <button
                type="button"
                aria-label={`Increase ${product.name}`}
                disabled={quantity >= MAX_QUANTITY}
                onClick={() => setQuantity(product.id, quantity + 1)}
                className="h-7 w-7 rounded border border-neutral-300 disabled:opacity-40"
              >
                +
              </button>
            </div>
            <span className="w-28 text-right tabular-nums">
              {formatMoney(total, cart.currency)}
            </span>
            <button
              type="button"
              onClick={() => remove(product.id)}
              className="text-sm text-neutral-500 hover:text-red-600"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-end gap-2 text-lg">
        <span>Total</span>
        <span data-testid="cart-total" className="font-semibold tabular-nums">
          {formatMoney(cartTotal(cart), cart.currency)}
        </span>
      </div>
      <div className="mt-6">
        <CheckoutButton cart={cart} />
      </div>
    </div>
  );
}
