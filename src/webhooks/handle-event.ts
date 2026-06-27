import type Stripe from "stripe";
import { updateOrder } from "@/orders/store";

const globalForEvents = globalThis as typeof globalThis & {
  processedStripeEvents?: Set<string>;
};

const processedEvents = (globalForEvents.processedStripeEvents ??= new Set<string>());

export function clearProcessedEvents() {
  processedEvents.clear();
}

function idOf(value: string | { id: string } | null) {
  return typeof value === "string" ? value : value?.id;
}

function handleSessionCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  if (!orderId || session.payment_status === "unpaid") return;

  updateOrder(orderId, {
    status: "paid",
    checkoutSessionId: session.id,
    paymentIntentId: idOf(session.payment_intent),
    customerEmail: session.customer_details?.email ?? undefined,
  });
}

export function handleStripeEvent(event: Stripe.Event): "processed" | "duplicate" {
  if (processedEvents.has(event.id)) {
    return "duplicate";
  }

  switch (event.type) {
    case "checkout.session.completed":
      handleSessionCompleted(event.data.object);
      break;
  }

  processedEvents.add(event.id);
  return "processed";
}
