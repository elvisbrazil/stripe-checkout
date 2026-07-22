import { describe, expect, it } from "vitest";
import { PricingError, priceItems } from "./pricing";

describe("priceItems", () => {
  it("prices lines from the catalog in the requested currency", () => {
    const order = priceItems(
      [
        { productId: "notebook-a5", quantity: 2 },
        { productId: "pen-brass", quantity: 1 },
      ],
      "USD",
    );

    expect(order.lines).toEqual([
      {
        productId: "notebook-a5",
        name: "A5 dot grid notebook",
        quantity: 2,
        unitAmount: 1800,
        total: 3600,
      },
      { productId: "pen-brass", name: "Brass pen", quantity: 1, unitAmount: 3200, total: 3200 },
    ]);
    expect(order.total).toBe(6800);
    expect(order.currency).toBe("USD");
  });

  it("ignores any price sent by the client", () => {
    const tampered = { productId: "hoodie-grey", quantity: 1, unitAmount: 1 };
    expect(priceItems([tampered], "BRL").total).toBe(24900);
  });

  it("rejects unknown products", () => {
    expect(() => priceItems([{ productId: "nope", quantity: 1 }], "BRL")).toThrow(PricingError);
  });

  it("rejects an empty cart", () => {
    expect(() => priceItems([], "BRL")).toThrow("Cart is empty");
  });
});
