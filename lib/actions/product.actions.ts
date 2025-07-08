'use server';

import { Product } from '@/types/product';
import { prisma } from '../prisma';
import { convertToPlainObject } from '../utils';
import { envs, PAGE_SIZE } from '../constants';
import { revalidatePath } from 'next/cache';
import { formatError } from '../error-handlers';

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

export async function getAllProducts({
  limit = PAGE_SIZE,
  page,
}: {
  query: string;
  limit?: number;
  page: number;
  category: string;
}) {
  const productsPromise = prisma.product.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });
  const countPromise = prisma.product.count();

  const [products, count] = await Promise.all([productsPromise, countPromise]);

  return {
    data: convertToPlainObject<Product[]>(products),
    totalPages: Math.ceil(count / limit),
  };
}

export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) throw new Error('Product not found');

    await prisma.product.delete({ where: { id } });

    revalidatePath('/admin/products');

    return {
      success: true,
      message: 'Product deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
