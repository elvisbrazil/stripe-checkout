import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { server, setupMockServer } from "@/test/msw";
import type { Cart } from "./cart";
import { CartView } from "./cart-view";

setupMockServer();

function storeCart(cart: Cart) {
  window.localStorage.setItem("cart", JSON.stringify(cart));
}

const total = () => screen.getByTestId("cart-total").textContent?.replace(/ /g, " ");

describe("CartView", () => {
  it("shows an empty state", () => {
    render(<CartView />);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("lists the stored items with the cart total", () => {
    storeCart({
      currency: "BRL",
      items: [
        { productId: "mug-ceramic", quantity: 2 },
        { productId: "sticker-pack", quantity: 1 },
      ],
    });

    render(<CartView />);

    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(total()).toBe("R$ 139,70");
  });

  it("updates quantity and total and persists the change", async () => {
    const user = userEvent.setup();
    storeCart({ currency: "USD", items: [{ productId: "mug-ceramic", quantity: 1 }] });

    render(<CartView />);
    await user.click(screen.getByRole("button", { name: "Increase Ceramic mug" }));

    expect(screen.getByLabelText("Ceramic mug quantity")).toHaveTextContent("2");
    expect(total()).toBe("$28.00");
    expect(JSON.parse(window.localStorage.getItem("cart")!).items).toEqual([
      { productId: "mug-ceramic", quantity: 2 },
    ]);
  });

  it("removes an item", async () => {
    const user = userEvent.setup();
    storeCart({
      currency: "USD",
      items: [
        { productId: "mug-ceramic", quantity: 1 },
        { productId: "pen-brass", quantity: 1 },
      ],
    });

    render(<CartView />);
    const mugRow = screen.getByText("Ceramic mug").closest("li")!;
    await user.click(within(mugRow).getByRole("button", { name: "Remove" }));

    expect(screen.queryByText("Ceramic mug")).not.toBeInTheDocument();
    expect(total()).toBe("$32.00");
  });

  it("sends the cart to the checkout route and shows errors", async () => {
    const user = userEvent.setup();
    const cart: Cart = { currency: "BRL", items: [{ productId: "tote-canvas", quantity: 1 }] };
    storeCart(cart);
    let sent: unknown;
    server.use(
      http.post("*/api/checkout", async ({ request }) => {
        sent = await request.json();
        return HttpResponse.json({ error: "Could not start checkout" }, { status: 502 });
      }),
    );

    render(<CartView />);
    await user.click(screen.getByRole("button", { name: "Checkout" }));

    expect(await screen.findByText("Could not start checkout")).toBeInTheDocument();
    expect(sent).toEqual(cart);
    expect(screen.getByRole("button", { name: "Checkout" })).toBeEnabled();
  });
});
