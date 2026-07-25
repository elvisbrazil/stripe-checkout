import { MAX_QUANTITY, type CartItem } from "@/cart/cart";
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

function mergeItems(items: CartItem[]) {
  const quantities = new Map<string, number>();
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);
  }
  return [...quantities].map(([productId, quantity]) => ({ productId, quantity }));
}

export function priceItems(items: CartItem[], currency: Currency): PricedOrder {
  if (items.length === 0) {
    throw new PricingError("Cart is empty");
  }

  const lines = mergeItems(items).map((item) => {
    const product = findProduct(item.productId);
    if (!product) {
      throw new PricingError(`Unknown product: ${item.productId}`);
    }
    if (item.quantity > MAX_QUANTITY) {
      throw new PricingError(`Too many units of ${product.name}`);
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
