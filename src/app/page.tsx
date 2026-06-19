import { ProductList } from "@/catalog/product-list";

export default function Home() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Products</h1>
      <ProductList />
    </>
  );
}
