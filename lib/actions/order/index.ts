'use server';

import { auth } from '@/auth';
import { Prisma } from '@/generated/prisma';
import { getMyCart } from '@/lib/cart/get-my-cart';
import { envs, DEFAULT_PAGINATION_LIMIT } from '@/lib/constants';
import { formatError } from '@/lib/error-handlers';
import { paypal } from '@/lib/paypal';
import { prisma } from '@/lib/prisma';
import { calculateTotalPages, convertToPlainObject } from '@/lib/utils';
import { insertOrderSchema } from '@/lib/validators';
import { CartItem } from '@/types/cart';
import type { Order } from '@/types/order';
import { PaymentResult } from '@/types/paypal';
import { revalidatePath } from 'next/cache';
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
      const orderItemsPromise = tx.orderItem.createMany({
        data: cart.items.map((item: CartItem) => ({
          ...item,
          orderId: insertedOrder.id,
        })),
      });

      const cartUpdatePromise = tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          shippingPrice: 0,
          taxPrice: 0,
          totalPrice: 0,
          itemsPrice: 0,
        },
      });

      await Promise.all([orderItemsPromise, cartUpdatePromise]);

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
  paymentResult?: PaymentResult;
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

export const getMyOrders = async ({
  limit = DEFAULT_PAGINATION_LIMIT,
  page,
}: {
  limit?: number;
  page: number;
}) => {
  const session = await auth();
  if (!session?.user) throw new Error('User is not authenticated');

  const userOrdersQuery = prisma.order.findMany({
    where: {
      userId: session.user.id,
    },
    take: limit,
    skip: (page - 1) * limit,
    orderBy: {
      createdAt: 'desc',
    },
  });

  const totalUserOrderQuery = prisma.order.count({
    where: {
      userId: session.user.id,
    },
  });

  const [userOrders, totalUserOrderCount] = await Promise.all([
    userOrdersQuery,
    totalUserOrderQuery,
  ]);
  return {
    data: userOrders,
    totalPages: calculateTotalPages({ count: totalUserOrderCount, limit }),
  };
};

export const getOrderSummary = async () => {
  const ordersCountPromise = prisma.order.count();
  const productsCountPromise = prisma.product.count();
  const usersCountPromise = prisma.user.count();

  const totalSalesPromise = prisma.order
    .aggregate({
      _sum: {
        totalPrice: true,
      },
    })
    .then((data) => Number(data._sum.totalPrice ?? 0));

  const orderTable = Prisma.raw(`"${envs.SCHEMA_NAME}"."Order"`);
  const monthAlias = Prisma.raw(`to_char("createdAt", 'MM/YY') as "month"`);
  const totalSalesAlias = Prisma.raw(`sum("totalPrice") as "totalSales"`);
  const sql = Prisma.sql`SELECT ${monthAlias}, ${totalSalesAlias} FROM ${orderTable} GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesDataPromise = prisma
    .$queryRaw<Array<{ month: string; totalSales: Prisma.Decimal }>>(sql)
    .then((res) =>
      res.map((entry) => ({
        month: entry.month,
        totalSales: Number(entry.totalSales),
      }))
    );

  const latestSalesPromise = prisma.order.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });

  const [
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
    latestSales,
  ] = await Promise.all([
    ordersCountPromise,
    productsCountPromise,
    usersCountPromise,
    totalSalesPromise,
    salesDataPromise,
    latestSalesPromise,
  ]);

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
    latestSales,
  };
};

export async function getAllOrders({
  limit = DEFAULT_PAGINATION_LIMIT,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const dataPromise = prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });

  const dataCountPromise = prisma.order.count();

  const [data, dataCount] = await Promise.all([dataPromise, dataCountPromise]);

  return {
    data,
    totalPages: calculateTotalPages({ count: dataCount, limit }),
  };
}

export const deleteOrder = async (
  orderId: string
): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    await prisma.order.delete({
      where: {
        id: orderId,
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export async function updateOrderToPaidByCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });
    revalidatePath(`/order/${orderId}`);
    return { success: true, message: 'Order paid successfully' };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });

    if (!order) throw new Error('Order not found');
    if (!order.isPaid) throw new Error('Order is not paid');

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return { success: true, message: 'Order delivered successfully' };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}
