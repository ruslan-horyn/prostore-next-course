'use server';

import { Cart } from '@/types/cart';

import { prisma } from '@/lib/prisma';
import { convertToPlainObject } from '@/lib/utils';
import { getSessionCartId } from '../cookies/get-session-car-id';
import { auth } from '@/auth';

export const getMyCart = async () => {
  const sessionCartId = await getSessionCartId();
  const session = await auth();
  const userId = session?.user?.id;

  const cart = await prisma.cart.findFirst({
    where: userId ? { userId } : { sessionCartId },
  });

  if (!cart) {
    return undefined;
  }

  return convertToPlainObject<Cart>(cart);
};
