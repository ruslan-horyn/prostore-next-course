import { Product } from "@/types/product";
import { ProductCard } from "./product-card";

interface ProductListProps {
  data: Product[];
  title?: string;
  limit?: number;
}

export const ProductList = ({ data, title, limit }: ProductListProps) => {
  const products = limit ? data.slice(0, limit) : data;
  return (
    <div className="my-10">
      <h2 className="h2-bold">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.length === 0 && <div>No products found</div>}
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </div>
  );
};
