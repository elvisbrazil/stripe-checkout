import { z } from "zod";
import { MAX_QUANTITY } from "@/cart/cart";
import { currencies } from "@/lib/money";

export const checkoutRequestSchema = z.object({
  currency: z.enum(currencies),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(MAX_QUANTITY),
      }),
    )
    .min(1)
    .max(20),
});

export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
