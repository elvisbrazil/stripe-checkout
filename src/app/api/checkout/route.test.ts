import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearOrders, listOrders } from "@/orders/store";
import { server, setupMockServer } from "@/test/msw";
import { POST } from "./route";

setupMockServer();

type CapturedRequest = { params: URLSearchParams; headers: Headers };

function mockSessionCreate() {
  const requests: CapturedRequest[] = [];
  server.use(
    http.post("https://api.stripe.com/v1/checkout/sessions", async ({ request }) => {
      requests.push({
        params: new URLSearchParams(await request.text()),
        headers: request.headers,
      });
      return HttpResponse.json({
        id: "cs_test_123",
        object: "checkout.session",
        url: "https://checkout.stripe.com/c/pay/cs_test_123",
      });
    }),
  );
  return requests;
}

function checkout(body: unknown) {
  return POST(
    new Request("http://localhost:3000/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
  vi.stubEnv("APP_URL", "http://localhost:3000");
});

afterEach(() => {
  vi.unstubAllEnvs();
  clearOrders();
});

describe("POST /api/checkout", () => {
  it("creates a session with prices taken from the catalog", async () => {
    const requests = mockSessionCreate();

    const response = await checkout({
      currency: "BRL",
      items: [
        { productId: "mug-ceramic", quantity: 2, unitAmount: 1 },
        { productId: "pen-brass", quantity: 1 },
      ],
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ url: "https://checkout.stripe.com/c/pay/cs_test_123" });
    expect(requests).toHaveLength(1);

    const { params } = requests[0];
    expect(params.get("mode")).toBe("payment");
    expect(params.get("line_items[0][quantity]")).toBe("2");
    expect(params.get("line_items[0][price_data][currency]")).toBe("brl");
    expect(params.get("line_items[0][price_data][unit_amount]")).toBe("5990");
    expect(params.get("line_items[0][price_data][product_data][name]")).toBe("Ceramic mug");
    expect(params.get("line_items[1][price_data][unit_amount]")).toBe("12990");
    expect(params.get("success_url")).toBe(
      "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
    );
    expect(params.get("cancel_url")).toBe("http://localhost:3000/cart");
  });

  it("links the session to the order through metadata and the idempotency key", async () => {
    const requests = mockSessionCreate();

    await checkout({ currency: "USD", items: [{ productId: "tote-canvas", quantity: 1 }] });

    const [order] = listOrders();
    const { params, headers } = requests[0];
    expect(params.get("metadata[orderId]")).toBe(order.id);
    expect(params.get("client_reference_id")).toBe(order.id);
    expect(params.get("payment_intent_data[metadata][orderId]")).toBe(order.id);
    expect(headers.get("idempotency-key")).toBe(`checkout-session-${order.id}`);
    expect(order).toMatchObject({
      status: "pending",
      total: 2200,
      checkoutSessionId: "cs_test_123",
    });
  });

  it("rejects unknown products without calling Stripe", async () => {
    const requests = mockSessionCreate();

    const response = await checkout({
      currency: "BRL",
      items: [{ productId: "free-stuff", quantity: 1 }],
    });

    expect(response.status).toBe(400);
    expect(requests).toHaveLength(0);
    expect(listOrders()).toHaveLength(0);
  });

  it("rejects malformed carts", async () => {
    const response = await checkout({
      currency: "EUR",
      items: [{ productId: "mug-ceramic", quantity: 0 }],
    });

    expect(response.status).toBe(400);
  });

  it("returns 502 when Stripe refuses the request", async () => {
    server.use(
      http.post("https://api.stripe.com/v1/checkout/sessions", () =>
        HttpResponse.json(
          { error: { type: "invalid_request_error", message: "Invalid currency" } },
          { status: 400 },
        ),
      ),
    );

    const response = await checkout({
      currency: "BRL",
      items: [{ productId: "mug-ceramic", quantity: 1 }],
    });

    expect(response.status).toBe(502);
  });
});
