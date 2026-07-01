import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";

export async function retrieveSession(sessionId: string) {
  try {
    return await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      return null;
    }
    throw error;
  }
}
