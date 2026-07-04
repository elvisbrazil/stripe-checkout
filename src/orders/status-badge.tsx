import type { OrderStatus } from "./store";

const styles: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  expired: "bg-neutral-200 text-neutral-700",
  refunded: "bg-sky-100 text-sky-800",
  partially_refunded: "bg-sky-100 text-sky-800",
};

const labels: Record<OrderStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  expired: "Expired",
  refunded: "Refunded",
  partially_refunded: "Partially refunded",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
