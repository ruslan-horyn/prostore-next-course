'use server';
import { calculateCartPrise } from '@/lib/cart';
import { getMyCart } from '@/lib/cart/get-my-cart';
import { formatError } from '@/lib/error-handlers';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const removeItemFromCart = async (productId: string) => {
  try {
    const [card, product] = await Promise.all([
      getMyCart(),
      prisma.product.findFirstOrThrow({
        where: {
          id: productId,
        },
      }),
    ]);

    if (!card) {
      throw new Error('Cart not found');
    }

    const existCardItem = card.items.find(
      (item) => item.productId === productId
    );
    if (!existCardItem) {
      throw new Error('Item not found');
    }

    if (existCardItem.qty > 1) {
      existCardItem.qty -= 1;
    } else {
      card.items = card.items.filter((item) => item.productId !== productId);
    }

    await prisma.cart.update({
      where: {
        id: card.id,
      },
      data: {
        items: card.items,
        ...calculateCartPrise(card.items),
      },
    });

    revalidatePath(`/products/${product.name}`, 'page');

    return Promise.resolve({
      success: true,
      isSubmitted: true,
      message: `The ${product.name} was removed from cart`,
    });
  } catch (error) {
    return Promise.resolve({
      isSubmitted: false,
      success: false,
      message: formatError(error),
    });
  }
};
