import { findProduct, type Product } from "@/catalog/products";
import { isCurrency, type Currency } from "@/lib/money";

export const MAX_QUANTITY = 10;

export type CartItem = {
  productId: string;
  quantity: number;
};

export type Cart = {
  currency: Currency;
  items: CartItem[];
};

export type CartLine = {
  product: Product;
  quantity: number;
  unitAmount: number;
  total: number;
};

export const emptyCart: Cart = { currency: "BRL", items: [] };

export function addItem(cart: Cart, productId: string): Cart {
  const existing = cart.items.find((item) => item.productId === productId);
  if (!existing) {
    return { ...cart, items: [...cart.items, { productId, quantity: 1 }] };
  }
  return setQuantity(cart, productId, existing.quantity + 1);
}

export function setQuantity(cart: Cart, productId: string, quantity: number): Cart {
  if (quantity <= 0) {
    return removeItem(cart, productId);
  }
  const clamped = Math.min(Math.floor(quantity), MAX_QUANTITY);
  return {
    ...cart,
    items: cart.items.map((item) =>
      item.productId === productId ? { ...item, quantity: clamped } : item,
    ),
  };
}

export function removeItem(cart: Cart, productId: string): Cart {
  return { ...cart, items: cart.items.filter((item) => item.productId !== productId) };
}

export function setCurrency(cart: Cart, currency: Currency): Cart {
  return { ...cart, currency };
}

export function cartCount(cart: Cart) {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartLines(cart: Cart): CartLine[] {
  return cart.items.flatMap((item) => {
    const product = findProduct(item.productId);
    if (!product) return [];
    const unitAmount = product.prices[cart.currency];
    return [{ product, quantity: item.quantity, unitAmount, total: unitAmount * item.quantity }];
  });
}

export function cartTotal(cart: Cart) {
  return cartLines(cart).reduce((sum, line) => sum + line.total, 0);
}

export function parseCart(raw: string | null): Cart {
  if (!raw) return emptyCart;
  try {
    const data = JSON.parse(raw);
    if (!isCurrency(data?.currency) || !Array.isArray(data?.items)) return emptyCart;
    const items = data.items.filter(
      (item: unknown): item is CartItem =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as CartItem).productId === "string" &&
        Number.isInteger((item as CartItem).quantity) &&
        (item as CartItem).quantity > 0,
    );
    return { currency: data.currency, items };
  } catch {
    return emptyCart;
  }
}
