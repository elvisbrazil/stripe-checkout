import type { CartItem } from "@/cart/cart";
import { findProduct } from "@/catalog/products";
import type { Currency } from "@/lib/money";

export class PricingError extends Error {}

export type PricedLine = {
  productId: string;
  name: string;
  quantity: number;
  unitAmount: number;
  total: number;
};

export type PricedOrder = {
  currency: Currency;
  lines: PricedLine[];
  total: number;
};

export function priceItems(items: CartItem[], currency: Currency): PricedOrder {
  if (items.length === 0) {
    throw new PricingError("Cart is empty");
  }

  const lines = items.map((item) => {
    const product = findProduct(item.productId);
    if (!product) {
      throw new PricingError(`Unknown product: ${item.productId}`);
    }
    const unitAmount = product.prices[currency];
    return {
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      unitAmount,
      total: unitAmount * item.quantity,
    };
  });

  return {
    currency,
    lines,
    total: lines.reduce((sum, line) => sum + line.total, 0),
  };
}
