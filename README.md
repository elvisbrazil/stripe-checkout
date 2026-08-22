# stripe-checkout

A small store built with Next.js that takes payments through Stripe Checkout. Products live in a local catalog, the cart is kept in the browser, and orders are updated from Stripe webhooks.

## Running locally

You need a Stripe account in test mode and the [Stripe CLI](https://docs.stripe.com/stripe-cli).

```bash
pnpm install
cp .env.example .env.local
```

Put your test secret key (`sk_test_...`) in `.env.local`, then forward webhooks to the app:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret it prints into `STRIPE_WEBHOOK_SECRET` and start the dev server:

```bash
pnpm dev
```

Pay with the test card `4242 4242 4242 4242`, any future date and any CVC. Refunds made from the Stripe dashboard show up on `/orders`.

```bash
pnpm test
```

## Webhook events

| Event                        | Effect on the order                                |
| ---------------------------- | -------------------------------------------------- |
| `checkout.session.completed` | `paid`, stores the payment intent and email        |
| `checkout.session.expired`   | `expired`, only if the order is still pending      |
| `charge.refunded`            | `refunded` or `partially_refunded` with the amount |

Anything else is acknowledged and ignored.

## Design notes

- Prices are stored in cents per currency (BRL and USD). The client only sends product ids and quantities; the checkout route prices everything again from the catalog, so a tampered cart cannot change what is charged.
- Checkout sessions use `price_data` instead of Stripe Price objects, which keeps the catalog in one place. The internal order id goes into `metadata`, `client_reference_id` and the payment intent metadata, and the idempotency key is derived from it.
- The webhook route reads the raw body and verifies it with `stripe.webhooks.constructEvent`. Event ids are recorded so redelivered events are acknowledged without being applied twice.
- Orders and processed event ids are kept in memory, so they reset when the server restarts. Swapping `src/orders/store.ts` for a database is the obvious next step.
- The Stripe client uses the fetch HTTP client. Tests intercept `api.stripe.com` with MSW and assert the exact form params sent, and webhook tests sign payloads with `generateTestHeaderString`.
