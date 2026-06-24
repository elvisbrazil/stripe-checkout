import type Stripe from "stripe";
import type { Order } from "@/orders/store";

export function buildSessionParams(order: Order, origin: string): Stripe.Checkout.SessionCreateParams {
  return {
    mode: "payment",
    line_items: order.lines.map((line) => ({
      quantity: line.quantity,
      price_data: {
        currency: order.currency.toLowerCase(),
        unit_amount: line.unitAmount,
        product_data: {
          name: line.name,
          metadata: { productId: line.productId },
        },
      },
    })),
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/cart`,
    client_reference_id: order.id,
    metadata: { orderId: order.id },
    payment_intent_data: {
      metadata: { orderId: order.id },
    },
  };
}

export function createCheckoutSession(stripe: Stripe, order: Order, origin: string) {
  return stripe.checkout.sessions.create(buildSessionParams(order, origin), {
    idempotencyKey: `checkout-session-${order.id}`,
  });
}
