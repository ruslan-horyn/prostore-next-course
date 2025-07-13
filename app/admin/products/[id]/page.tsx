import { ProductForm } from '@/components/shared/admin/product-form/product-form';
import { getProductById } from '@/lib/actions/product.actions';
import { requiredAdmin } from '@/lib/auth-guard';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Update Product',
};

const AdminUpdateProductPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  await requiredAdmin();
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) return redirect('/admin/products');

  return (
    <div className='mx-auto max-w-5xl space-y-8'>
      <h1 className='h2-bold'>Update Product</h1>
      <ProductForm type='Update' product={product} />
    </div>
  );
};

export default AdminUpdateProductPage;
