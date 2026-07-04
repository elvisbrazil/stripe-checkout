import { formatMoney } from "@/lib/money";
import { StatusBadge } from "@/orders/status-badge";
import { listOrders } from "@/orders/store";

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default function OrdersPage() {
  const orders = listOrders();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-neutral-600">No orders yet.</p>
      ) : (
        <table className="w-full overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm">
          <thead className="bg-neutral-100 text-left text-neutral-600">
            <tr>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3 font-medium">Date</th>
              <th className="p-3 font-medium">Items</th>
              <th className="p-3 text-right font-medium">Total</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="p-3 font-mono text-xs">{order.id}</td>
                <td className="p-3">{dateFormat.format(new Date(order.createdAt))}</td>
                <td className="p-3">
                  {order.lines.reduce((sum, line) => sum + line.quantity, 0)}
                </td>
                <td className="p-3 text-right tabular-nums">
                  {formatMoney(order.total, order.currency)}
                </td>
                <td className="p-3">
                  <StatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
