'use server';

import { auth } from '@/auth';
import { calculateCartPrise } from '@/lib/cart';
import { getMyCart } from '@/lib/cart/get-my-cart';
import { getSessionCartId } from '@/lib/cookies/get-session-car-id';
import { formatError } from '@/lib/error-handlers';
import { prisma } from '@/lib/prisma';
import { convertToPlainObject } from '@/lib/utils';
import { cartItemSchema, insertCartSchema } from '@/lib/validators';
import { Cart, CartItem } from '@/types/cart';
import { Product } from '@/types/product';
import { revalidatePath } from 'next/cache';

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
      getMyCart(),
      prisma.product.findFirstOrThrow({
        where: {
          id: item.productId,
        },
      }),
    ]);

    if (!card) {
      await addItemToNonExistingCart({
        item,
        userId,
        sessionCartId,
      });
    }

    if (card) {
      await addItemToExistingCart({
        item,
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
