import { describe, expect, it } from "vitest";
import {
  MAX_QUANTITY,
  addItem,
  cartCount,
  cartTotal,
  emptyCart,
  parseCart,
  removeItem,
  setCurrency,
  setQuantity,
  type Cart,
} from "./cart";

const cart: Cart = {
  currency: "BRL",
  items: [
    { productId: "mug-ceramic", quantity: 2 },
    { productId: "sticker-pack", quantity: 1 },
  ],
};

describe("cart", () => {
  it("adds a new product with quantity one", () => {
    const next = addItem(emptyCart, "pen-brass");
    expect(next.items).toEqual([{ productId: "pen-brass", quantity: 1 }]);
  });

  it("increments the quantity when the product is already in the cart", () => {
    const next = addItem(cart, "mug-ceramic");
    expect(next.items[0]).toEqual({ productId: "mug-ceramic", quantity: 3 });
  });

  it("caps quantities at the maximum", () => {
    const next = setQuantity(cart, "mug-ceramic", 50);
    expect(next.items[0].quantity).toBe(MAX_QUANTITY);
  });

  it("removes the line when quantity drops to zero", () => {
    const next = setQuantity(cart, "sticker-pack", 0);
    expect(next.items.map((item) => item.productId)).toEqual(["mug-ceramic"]);
  });

  it("removes a product", () => {
    expect(removeItem(cart, "mug-ceramic").items).toHaveLength(1);
  });

  it("counts units across lines", () => {
    expect(cartCount(cart)).toBe(3);
  });

  it("totals in the selected currency", () => {
    expect(cartTotal(cart)).toBe(2 * 5990 + 1990);
    expect(cartTotal(setCurrency(cart, "USD"))).toBe(2 * 1400 + 500);
  });

  it("ignores products that are no longer in the catalog", () => {
    const stale = { ...cart, items: [...cart.items, { productId: "gone", quantity: 1 }] };
    expect(cartTotal(stale)).toBe(cartTotal(cart));
  });
});

describe("parseCart", () => {
  it("round-trips a stored cart", () => {
    expect(parseCart(JSON.stringify(cart))).toEqual(cart);
  });

  it("falls back to an empty cart on invalid data", () => {
    expect(parseCart(null)).toEqual(emptyCart);
    expect(parseCart("{not json")).toEqual(emptyCart);
    expect(parseCart(JSON.stringify({ currency: "EUR", items: [] }))).toEqual(emptyCart);
  });

  it("drops malformed items", () => {
    const raw = JSON.stringify({
      currency: "USD",
      items: [{ productId: "mug-ceramic", quantity: 1 }, { productId: "x", quantity: -2 }, "junk"],
    });
    expect(parseCart(raw).items).toEqual([{ productId: "mug-ceramic", quantity: 1 }]);
  });
});
