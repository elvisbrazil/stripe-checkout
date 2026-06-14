export const currencies = ["BRL", "USD"] as const;

export type Currency = (typeof currencies)[number];

const locales: Record<Currency, string> = {
  BRL: "pt-BR",
  USD: "en-US",
};

export function isCurrency(value: unknown): value is Currency {
  return typeof value === "string" && (currencies as readonly string[]).includes(value);
}

export function formatMoney(cents: number, currency: Currency) {
  return new Intl.NumberFormat(locales[currency], {
    style: "currency",
    currency,
  }).format(cents / 100);
}
