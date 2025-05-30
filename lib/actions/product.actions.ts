import { Product } from '@/types/product';
import { prisma } from '../prisma';
import { convertToPlainObject } from '../utils';
import { envs } from '../constants';

export const getLatestProducts = async () => {
  const products = await prisma.product.findMany({
    take: envs.LATEST_PRODUCTS_LIMIT,
    orderBy: {
      createdAt: 'desc',
    },
  });
  return convertToPlainObject<Product[]>(products);
};

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug: slug },
  });

  if (!product) return null;
  return convertToPlainObject<Product>(product);
}
