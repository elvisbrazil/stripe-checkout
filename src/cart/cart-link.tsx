"use client";

import Link from "next/link";
import { cartCount } from "./cart";
import { useCart } from "./use-cart";

export function CartLink() {
  const { cart } = useCart();
  const count = cartCount(cart);

  return (
    <Link href="/cart" className="hover:text-neutral-900">
      Cart{count > 0 && ` (${count})`}
    </Link>
  );
}
