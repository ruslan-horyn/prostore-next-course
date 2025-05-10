import { getMyCard } from '@/lib/card/get-my-card';
import { getSessionCartId } from '../../cookies/get-session-car-id';
import { prisma } from '../../prisma';
import { auth } from '@/auth';
import { calculateCartPrise } from '@/lib/card';
import { formatError } from '@/lib/error-handlers';
import { revalidatePath } from 'next/cache';

export const removeItemFromCart = async (productId: string) => {
  try {
    const sessionCartId = await getSessionCartId();
    const session = await auth();
    const userId = session?.user?.id;

    const [card, product] = await Promise.all([
      getMyCard({ userId, sessionCartId }),
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
