import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { priceItems } from "@/checkout/pricing";
import { clearOrders, createOrder, getOrder, updateOrder } from "@/orders/store";
import { clearProcessedEvents } from "@/webhooks/handle-event";
import { POST } from "./route";

const WEBHOOK_SECRET = "whsec_test_secret";
const stripe = new Stripe("sk_test_123");

function stripeEvent(id: string, type: string, object: Record<string, unknown>) {
  return { id, object: "event", type, created: 1767225600, data: { object } };
}

function sign(body: string, secret = WEBHOOK_SECRET) {
  return stripe.webhooks.generateTestHeaderString({ payload: body, secret });
}

function deliver(body: string, signature?: string) {
  const headers = new Headers();
  if (signature) headers.set("stripe-signature", signature);
  return POST(
    new Request("http://localhost:3000/api/webhooks/stripe", { method: "POST", headers, body }),
  );
}

function send(event: object) {
  const body = JSON.stringify(event);
  return deliver(body, sign(body));
}

function newOrder() {
  return createOrder(priceItems([{ productId: "mug-ceramic", quantity: 2 }], "BRL"));
}

function completed(eventId: string, orderId: string) {
  return stripeEvent(eventId, "checkout.session.completed", {
    id: "cs_test_1",
    object: "checkout.session",
    payment_status: "paid",
    payment_intent: "pi_test_1",
    metadata: { orderId },
    customer_details: { email: "ana@example.com" },
  });
}

function refunded(eventId: string, amount: number, amountRefunded: number) {
  return stripeEvent(eventId, "charge.refunded", {
    id: "ch_test_1",
    object: "charge",
    payment_intent: "pi_test_1",
    amount,
    amount_refunded: amountRefunded,
    metadata: {},
  });
}

beforeEach(() => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", WEBHOOK_SECRET);
});

afterEach(() => {
  vi.unstubAllEnvs();
  clearOrders();
  clearProcessedEvents();
});

describe("POST /api/webhooks/stripe", () => {
  it("rejects requests without a signature header", async () => {
    const response = await deliver(JSON.stringify(completed("evt_1", "ord_1")));
    expect(response.status).toBe(400);
  });

  it("rejects payloads signed with another secret", async () => {
    const order = newOrder();
    const body = JSON.stringify(completed("evt_1", order.id));

    const response = await deliver(body, sign(body, "whsec_someone_else"));

    expect(response.status).toBe(400);
    expect(getOrder(order.id)?.status).toBe("pending");
  });

  it("rejects a payload that was changed after signing", async () => {
    const order = newOrder();
    const body = JSON.stringify(completed("evt_1", order.id));
    const signature = sign(body);

    const response = await deliver(body.replace("paid", "unpaid"), signature);

    expect(response.status).toBe(400);
  });

  it("fails loudly when the webhook secret is not configured", async () => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
    const response = await send(completed("evt_1", "ord_1"));
    expect(response.status).toBe(500);
  });

  it("marks the order as paid when the session completes", async () => {
    const order = newOrder();

    const response = await send(completed("evt_1", order.id));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ received: true, duplicate: false });
    expect(getOrder(order.id)).toMatchObject({
      status: "paid",
      paymentIntentId: "pi_test_1",
      customerEmail: "ana@example.com",
    });
  });

  it("processes a redelivered event only once", async () => {
    const order = newOrder();
    await send(completed("evt_1", order.id));
    await send(refunded("evt_2", order.total, order.total));

    const response = await send(completed("evt_1", order.id));

    expect(await response.json()).toEqual({ received: true, duplicate: true });
    expect(getOrder(order.id)?.status).toBe("refunded");
  });

  it("expires pending orders when the session expires", async () => {
    const order = newOrder();

    await send(
      stripeEvent("evt_1", "checkout.session.expired", {
        id: "cs_test_1",
        object: "checkout.session",
        metadata: { orderId: order.id },
      }),
    );

    expect(getOrder(order.id)?.status).toBe("expired");
  });

  it("does not expire an order that was already paid", async () => {
    const order = newOrder();
    updateOrder(order.id, { status: "paid" });

    await send(
      stripeEvent("evt_1", "checkout.session.expired", {
        id: "cs_test_1",
        object: "checkout.session",
        metadata: { orderId: order.id },
      }),
    );

    expect(getOrder(order.id)?.status).toBe("paid");
  });

  it("tracks full and partial refunds", async () => {
    const order = newOrder();
    await send(completed("evt_1", order.id));

    await send(refunded("evt_2", order.total, 5990));
    expect(getOrder(order.id)).toMatchObject({
      status: "partially_refunded",
      amountRefunded: 5990,
    });

    await send(refunded("evt_3", order.total, order.total));
    expect(getOrder(order.id)).toMatchObject({ status: "refunded", amountRefunded: order.total });
  });

  it("acknowledges event types it does not handle", async () => {
    const response = await send(stripeEvent("evt_1", "customer.created", { id: "cus_1" }));
    expect(response.status).toBe(200);
  });
});
