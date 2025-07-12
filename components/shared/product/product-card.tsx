import { Card, CardContent, CardHeader } from '@/components/ui/card';

import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { ProductPrice } from './product-price';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const image = product.images[0];
  return (
    <Card className='w-full max-w-sm'>
      <CardHeader className='items-center p-0'>
        <Link href={`/product/${product.slug}`}>
          {image && (
            <Image
              priority
              src={image}
              alt={product.name}
              className='aspect-square h-full w-full rounded object-cover'
              height={300}
              width={300}
            />
          )}
        </Link>
      </CardHeader>
      <CardContent className='grid gap-4 p-4'>
        <div className='text-xs'>{product.brand}</div>
        <Link href={`/product/${product.slug}`}>
          <h2 className='text-sm font-medium'>{product.name}</h2>
        </Link>
        <div className='flex-between gap-4'>
          <p>{product.rating} stars</p>
          {product.stock > 0 ? (
            <ProductPrice value={Number(product.price)} />
          ) : (
            <p className='text-destructive'>Out of Stock</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
