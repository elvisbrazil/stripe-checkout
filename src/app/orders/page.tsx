import { OrdersTable } from "@/orders/orders-table";
import { listOrders } from "@/orders/store";

export const dynamic = "force-dynamic";

export default function OrdersPage() {
  const orders = listOrders();

  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-neutral-600">No orders yet.</p>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </>
  );
}
