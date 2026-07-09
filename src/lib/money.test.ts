import { describe, expect, it } from "vitest";
import { formatMoney, isCurrency } from "./money";

describe("formatMoney", () => {
  it("formats BRL cents with the Brazilian locale", () => {
    expect(formatMoney(12990, "BRL")).toBe("R$ 129,90");
  });

  it("formats USD cents", () => {
    expect(formatMoney(1400, "USD")).toBe("$14.00");
  });
});

describe("isCurrency", () => {
  it("accepts only supported currencies", () => {
    expect(isCurrency("BRL")).toBe(true);
    expect(isCurrency("usd")).toBe(false);
    expect(isCurrency(undefined)).toBe(false);
  });
});
