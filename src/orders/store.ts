import { randomUUID } from "node:crypto";
import type { PricedLine, PricedOrder } from "@/checkout/pricing";
import type { Currency } from "@/lib/money";

export type OrderStatus = "pending" | "paid" | "expired" | "refunded" | "partially_refunded";

export type Order = {
  id: string;
  status: OrderStatus;
  currency: Currency;
  lines: PricedLine[];
  total: number;
  amountRefunded: number;
  createdAt: string;
  checkoutSessionId?: string;
  paymentIntentId?: string;
  customerEmail?: string;
};

const globalForOrders = globalThis as typeof globalThis & {
  orders?: Map<string, Order>;
};

const orders = (globalForOrders.orders ??= new Map<string, Order>());

export function createOrder(priced: PricedOrder): Order {
  const order: Order = {
    id: `ord_${randomUUID().replace(/-/g, "").slice(0, 16)}`,
    status: "pending",
    currency: priced.currency,
    lines: priced.lines,
    total: priced.total,
    amountRefunded: 0,
    createdAt: new Date().toISOString(),
  };
  orders.set(order.id, order);
  return order;
}

export function getOrder(id: string) {
  return orders.get(id);
}

export function listOrders() {
  return [...orders.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function findOrderByPaymentIntent(paymentIntentId: string) {
  return [...orders.values()].find((order) => order.paymentIntentId === paymentIntentId);
}

export function updateOrder(id: string, changes: Partial<Omit<Order, "id">>) {
  const order = orders.get(id);
  if (!order) return undefined;
  const updated = { ...order, ...changes };
  orders.set(id, updated);
  return updated;
}

export function clearOrders() {
  orders.clear();
}
