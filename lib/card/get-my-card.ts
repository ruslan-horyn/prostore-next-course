'use server';

import { Cart } from '@/types/cart';

import { prisma } from '@/lib/prisma';
import { convertToPlainObject } from '@/lib/utils';

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
