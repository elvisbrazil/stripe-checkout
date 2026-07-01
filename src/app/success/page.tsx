import Link from "next/link";
import { notFound } from "next/navigation";
import { ClearCart } from "@/cart/clear-cart";
import { retrieveSession } from "@/checkout/retrieve-session";
import { formatMoney, isCurrency } from "@/lib/money";

type Props = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  if (!sessionId) notFound();

  const session = await retrieveSession(sessionId);
  if (!session) notFound();

  const currency = session.currency?.toUpperCase();
  if (!isCurrency(currency)) notFound();

  const paid = session.payment_status === "paid";

  return (
    <>
      {paid && <ClearCart />}
      <h1 className="text-2xl font-semibold">{paid ? "Thanks for your order" : "Payment pending"}</h1>
      <p className="mt-2 text-neutral-600">
        Order <span className="font-mono">{session.metadata?.orderId}</span>
        {session.customer_details?.email && <> - receipt sent to {session.customer_details.email}</>}
      </p>

      <ul className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {session.line_items?.data.map((item) => (
          <li key={item.id} className="flex justify-between p-4">
            <span>
              {item.quantity} x {item.description}
            </span>
            <span className="tabular-nums">{formatMoney(item.amount_total, currency)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right text-lg">
        Total{" "}
        <span className="font-semibold tabular-nums">
          {formatMoney(session.amount_total ?? 0, currency)}
        </span>
      </p>

      <Link href="/orders" className="mt-8 inline-block text-sm underline">
        See all orders
      </Link>
    </>
  );
}
