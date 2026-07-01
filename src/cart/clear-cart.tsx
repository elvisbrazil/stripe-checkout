"use client";

import { useEffect } from "react";
import { useCart } from "./use-cart";

export function ClearCart() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
