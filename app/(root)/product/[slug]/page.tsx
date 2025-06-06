import { AddToCart } from '@/components/shared/product/add-to-cart';
import { ProductImages } from '@/components/shared/product/product-images';
import { ProductPrice } from '@/components/shared/product/product-price';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getProductBySlug } from '@/lib/actions/product.actions';
import { getMyCart } from '@/lib/cart/get-my-cart';
import { notFound } from 'next/navigation';

interface ProductDetailsPageProps {
  params: Promise<{ slug: string }>;
}

const ProductDetailsPage = async ({ params }: ProductDetailsPageProps) => {
  const { slug } = await params;

  const [product, card] = await Promise.all([
    getProductBySlug(slug),
    getMyCart(),
  ]);
  if (!product) notFound();

  const isProductInStock = product.stock > 0;

  return (
    <>
      <section>
        <div className='grid grid-cols-1 md:grid-cols-5'>
          {/* Images Column */}
          <div className='col-span-2'>
            <ProductImages images={product.images} />
          </div>

          {/* Details Column */}
          <div className='col-span-2 p-5'>
            <div className='flex flex-col gap-6'>
              <p>
                {product.brand} {product.category}
              </p>
              <h1 className='h3-bold'>{product.name}</h1>
              <p>
                {product.rating} of {product.numReviews} reviews
              </p>

              <div className='flex flex-col gap-3 sm:flex-row sm:items-center'>
                <ProductPrice
                  value={Number(product.price)}
                  className='w-24 rounded-full bg-green-100 px-5 py-2 text-green-700'
                />
              </div>
            </div>
            <div className='mt-10'>
              <p>Description:</p>
              <p>{product.description}</p>
            </div>
          </div>
          {/* Action Column */}
          <div>
            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex justify-between'>
                  <div>Price</div>
                  <div>
                    <ProductPrice value={Number(product.price)} />
                  </div>
                </div>
                <div className='mb-2 flex justify-between'>
                  <div>Status</div>
                  {isProductInStock && (
                    <Badge variant='outline'>In stock</Badge>
                  )}
                  {!isProductInStock && (
                    <Badge variant='destructive'>Unavailable</Badge>
                  )}
                </div>
                {isProductInStock && (
                  <AddToCart
                    card={card}
                    item={{
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: product.price,
                      qty: 1,
                      image: product.images![0],
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProductDetailsPage;
