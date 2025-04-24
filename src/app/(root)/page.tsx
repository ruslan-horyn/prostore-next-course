import { ProductList } from "@/components/shared/product/product-list";
import { getLatestProducts } from "@/lib/actions/product.actions";
export default async function Home() {
  const products = await getLatestProducts();

  return <ProductList data={products} title="Newest Arrivals" />;
}
