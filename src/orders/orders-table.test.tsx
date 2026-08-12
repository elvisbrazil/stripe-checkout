import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrdersTable } from "./orders-table";
import type { Order } from "./store";

const order: Order = {
  id: "ord_abc",
  status: "partially_refunded",
  currency: "USD",
  lines: [
    { productId: "mug-ceramic", name: "Ceramic mug", quantity: 2, unitAmount: 1400, total: 2800 },
  ],
  total: 2800,
  amountRefunded: 1400,
  createdAt: "2026-08-01T12:00:00.000Z",
};

describe("OrdersTable", () => {
  it("shows status, total and refunded amount", () => {
    render(<OrdersTable orders={[order]} />);

    expect(screen.getByText("ord_abc")).toBeInTheDocument();
    expect(screen.getByText("Partially refunded")).toBeInTheDocument();
    expect(screen.getByText("$28.00")).toBeInTheDocument();
    expect(screen.getByText("-$14.00 refunded")).toBeInTheDocument();
  });

  it("hides the refund line when nothing was refunded", () => {
    render(<OrdersTable orders={[{ ...order, status: "paid", amountRefunded: 0 }]} />);
    expect(screen.queryByText(/refunded/)).not.toBeInTheDocument();
  });
});
