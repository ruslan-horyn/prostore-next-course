'use server';

import { Cart, CartItem } from '@/types/cart';
import { cookies as cookiesHeaders } from 'next/headers';
import { formatError } from '../error-handlers';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { calculateCartPrise } from '../card';
import { cookieNames } from '../constants';
import { convertToPlainObject } from '../utils';
import { cartItemSchema, insertCartSchema } from '../validators';

export const getMyCard = async ({
  userId,
  sessionCartId,
}: {
  userId?: string;
  sessionCartId?: string;
}) => {
  const card = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId },
  });

  if (!card) {
    return undefined;
  }

  return convertToPlainObject<Cart>(card);
};

export const addItemToCart = async (data: CartItem) => {
  try {
    const item = cartItemSchema.parse(data);
    const cookies = await cookiesHeaders();
    const sessionCartIdCookie = cookies.get(cookieNames.sessionCartId);
    let sessionCartId = sessionCartIdCookie?.value;

    if (!sessionCartId) {
      sessionCartId = crypto.randomUUID();
      cookies.set(cookieNames.sessionCartId, sessionCartId);
    }

    const session = await auth();
    const userId = session?.user?.id;
    const [card, product] = await Promise.all([
      getMyCard({ userId, sessionCartId }),
      prisma.product.findFirst({
        where: {
          id: item.productId,
        },
      }),
    ]);

    if (!product) {
      throw new Error('Product not found');
    }

    if (!card) {
      const parsedCart = insertCartSchema.parse({
        userId,
        items: [item],
        ...calculateCartPrise([item]),
        sessionCartId,
      });

      await prisma.cart.create({
        data: parsedCart,
      });
    }

    revalidatePath(`/products/${product.slug}`, 'page');

    return Promise.resolve({
      success: true,
      isSubmitted: true,
      message: `The ${data.name} added to the cart`,
    });
  } catch (error) {
    return Promise.resolve({
      success: false,
      isSubmitted: true,
      message: formatError(error),
    });
  }
};
