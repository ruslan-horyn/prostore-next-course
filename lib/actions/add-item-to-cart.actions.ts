'use server';

import { Cart, CartItem } from '@/types/cart';
import { Product } from '@/types/product';
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

export const getSessionCartId = async () => {
  const cookies = await cookiesHeaders();
  const sessionCartIdCookie = cookies.get(cookieNames.sessionCartId);
  let sessionCartId = sessionCartIdCookie?.value;

  if (!sessionCartId) {
    sessionCartId = crypto.randomUUID();
    cookies.set(cookieNames.sessionCartId, sessionCartId);
  }

  return sessionCartId;
};

export const addItemToNonExistingCart = async ({
  userId,
  item,
  sessionCartId,
}: {
  userId: string | undefined;
  item: CartItem;
  sessionCartId: string;
}) => {
  const parsedCart = insertCartSchema
    .omit({
      id: true,
    })
    .parse({
      userId,
      items: [item],
      ...calculateCartPrise([item]),
      sessionCartId,
    });

  return prisma.cart.create({
    data: parsedCart,
  });
};

export const addItemToExistingCart = async ({
  item,
  card,
  product,
}: {
  item: CartItem;
  card: Cart;
  product: Product;
}) => {
  const cardItems = card.items;
  const existingItem = cardItems.find((i) => i.productId === item.productId);

  if (existingItem) {
    if (existingItem.qty + 1 > product.stock) {
      throw new Error('Not enough stock');
    }
    existingItem.qty += 1;
  } else {
    if (item.qty > product.stock) {
      throw new Error('Not enough stock');
    }
    cardItems.push(item);
  }

  return prisma.cart.update({
    where: {
      id: card.id,
    },
    data: {
      items: cardItems,
      ...calculateCartPrise(cardItems),
    },
  });
};

export const addItemToCart = async (data: CartItem) => {
  try {
    const item = cartItemSchema.parse(data);
    const sessionCartId = await getSessionCartId();

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
      await addItemToNonExistingCart({
        item,
        userId,
        sessionCartId,
      });
    }

    if (card) {
      await addItemToExistingCart({
        item: item,
        card,
        product: convertToPlainObject<Product>(product),
      });
    }

    revalidatePath(`/products/${product.name}`, 'page');

    return Promise.resolve({
      success: true,
      isSubmitted: true,
      message: `The ${product.name} added to the cart`,
    });
  } catch (error) {
    return Promise.resolve({
      success: false,
      isSubmitted: true,
      message: formatError(error),
    });
  }
};
