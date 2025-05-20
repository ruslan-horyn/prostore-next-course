'use server';

import { auth } from '@/auth';
import { getMyCart } from '@/lib/cart/get-my-cart';
import { formatError } from '@/lib/error-handlers';
import { paypal } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';
import { convertToPlainObject } from '@/lib/utils';
import { insertOrderSchema } from '@/lib/validators';
import { CartItem } from '@/types/cart';
import type { Order } from '@/types/order';
import { revalidatePath } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { getUserById } from '../user.actions';
import { PaymentResult } from '@/types/paypal';

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

export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItem: true,
      user: { select: { name: true, email: true } },
    },
  });

  return convertToPlainObject<Order>(data);
}

export async function createPayPalOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (order) {
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      await prisma.order.update({
        where: {
          id: orderId,
        },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: '',
            status: '',
            pricePaid: '0',
          },
        },
      });

      return {
        success: true,
        message: 'PayPal order created successfully',
        data: paypalOrder.id as string,
      };
    } else {
      throw new Error('Order not found');
    }
  } catch (err) {
    return { success: false, message: formatError(err), data: '' };
  }
}

export const updateOrderToPaid = async ({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult: PaymentResult;
}) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderItem: true,
    },
  });
  if (!order) throw new Error('Order not found');

  if (order.isPaid) throw new Error('Order is already paid');

  const updatedOrder = await prisma.$transaction(async (tx) => {
    const orders = order.orderItem.map((item) =>
      tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      })
    );

    await Promise.all(orders);
    return tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
      include: {
        orderItem: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
  });

  return updatedOrder;
};
export const approvePayPalOrder = async (
  orderId: string,
  data: { orderID: string }
) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (!order) throw new Error('Order not found');

    const captureData = await paypal.capturePayment(data.orderID);
    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== 'COMPLETED'
    )
      throw new Error('Error in paypal payment');

    const updatedOrder = await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Your order has been successfully paid by PayPal',
      data: updatedOrder,
    };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
};
