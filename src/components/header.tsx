import Link from "next/link";
import { CartLink } from "@/cart/cart-link";
import { CurrencySelect } from "@/cart/currency-select";

export function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold">
          Paper &amp; Brass
        </Link>
        <nav className="flex items-center gap-5 text-sm text-neutral-600">
          <CartLink />
          <CurrencySelect />
        </nav>
      </div>
    </header>
  );
}
