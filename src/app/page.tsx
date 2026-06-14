import { products } from "@/catalog/products";
import { formatMoney } from "@/lib/money";

export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Store</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <li key={product.id} className="rounded-lg border border-neutral-200 bg-white p-4">
            <h2 className="font-medium">{product.name}</h2>
            <p className="mt-1 text-sm text-neutral-600">{product.description}</p>
            <p className="mt-3 text-sm font-medium">{formatMoney(product.prices.BRL, "BRL")}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
