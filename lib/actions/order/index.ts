'use server';

import { auth } from '@/auth';
import { getMyCart } from '@/lib/cart/get-my-cart';
import { formatError } from '@/lib/error-handlers';
import { prisma } from '@/lib/prisma';
import { insertOrderSchema } from '@/lib/validators';
import { CartItem } from '@/types/cart';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getUserById } from '../user.actions';

export const createOrder = async () => {
  try {
    const session = await auth();
    if (!session) throw new Error('User is not authenticated');

    const cart = await getMyCart();
    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0) {
      return {
        success: false,
        message: 'Your cart is empty',
        redirectTo: '/cart',
      };
    }
    if (!user.address) {
      return {
        success: false,
        message: 'Please add a shipping address',
        redirectTo: '/shipping-address',
      };
    }
    if (!user.paymentMethod) {
      return {
        success: false,
        message: 'Please select a payment method',
        redirectTo: '/payment-method',
      };
    }

    const order = insertOrderSchema.parse({
      userId: user.id,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod,
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    const insertedOrderId = await prisma.$transaction(async (tx) => {
      const insertedOrder = await tx.order.create({ data: order });
      await tx.orderItem.createMany({
        data: cart.items.map((item: CartItem) => ({
          ...item,
          orderId: insertedOrder.id,
          gty: item.qty,
        })),
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Order not created');

    return {
      success: true,
      message: 'Order successfully created',
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
};
