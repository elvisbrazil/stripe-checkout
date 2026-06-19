"use client";

import { useCart } from "@/cart/use-cart";
import { formatMoney } from "@/lib/money";
import { products } from "./products";

export function ProductList() {
  const { cart, add } = useCart();

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <li
          key={product.id}
          className="flex flex-col rounded-lg border border-neutral-200 bg-white p-4"
        >
          <h2 className="font-medium">{product.name}</h2>
          <p className="mt-1 flex-1 text-sm text-neutral-600">{product.description}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm font-medium">
              {formatMoney(product.prices[cart.currency], cart.currency)}
            </span>
            <button
              type="button"
              onClick={() => add(product.id)}
              className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700"
            >
              Add to cart
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
