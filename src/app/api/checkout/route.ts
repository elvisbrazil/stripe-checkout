import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createCheckoutSession } from "@/checkout/create-session";
import { PricingError, priceItems } from "@/checkout/pricing";
import { checkoutRequestSchema } from "@/checkout/schema";
import { getStripe } from "@/lib/stripe";
import { createOrder, updateOrder } from "@/orders/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = checkoutRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  let order;
  try {
    order = createOrder(priceItems(parsed.data.items, parsed.data.currency));
  } catch (error) {
    if (error instanceof PricingError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  const origin = process.env.APP_URL ?? new URL(request.url).origin;

  try {
    const session = await createCheckoutSession(getStripe(), order, origin);
    updateOrder(order.id, { checkoutSessionId: session.id });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json({ error: "Could not start checkout" }, { status: 502 });
    }
    throw error;
  }
}
