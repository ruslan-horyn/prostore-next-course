'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  approvePayPalOrder,
  createPayPalOrder,
  deliverOrder,
  updateOrderToPaidByCOD,
} from '@/lib/actions/order';
import { formatCurrency, formatDateTime, formatId } from '@/lib/utils';
import { Order } from '@/types/order';
import {
  PayPalButtons,
  PayPalScriptProvider,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import Image from 'next/image';
import Link from 'next/link';
import { useTransition } from 'react';
import { toast } from 'sonner';

const MarkAsPaidButton = ({ orderId }: { orderId: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type='button'
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await updateOrderToPaidByCOD(orderId);
          const currentToast = res.success ? toast.success : toast.error;
          currentToast(res.message);
        })
      }
    >
      {isPending ? 'Processing...' : 'Mark As Paid'}
    </Button>
  );
};

const MarkAsDeliveredButton = ({ orderId }: { orderId: string }) => {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type='button'
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          const res = await deliverOrder(orderId);
          const currentToast = res.success ? toast.success : toast.error;
          currentToast(res.message);
        })
      }
    >
      {isPending ? 'Processing...' : 'Mark As Delivered'}
    </Button>
  );
};

function PrintLoadingState() {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  let status = '';
  if (isPending) {
    status = 'Loading PayPal...';
  } else if (isRejected) {
    status = 'Error in loading PayPal.';
  }
  return status;
}

export const OrderDetailsTable = ({
  order,
  paypalClientId,
  isAdmin,
}: {
  order: Order;
  paypalClientId: string;
  isAdmin: boolean;
}) => {
  const {
    shippingAddress,
    orderItem,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
  } = order;

  const handleCreatePayPalOrder = async () => {
    const res = await createPayPalOrder(order.id);
    if (!res.success) {
      toast.error(res.message);
    }
    return res.data;
  };

  const handleApprovePayPalOrder = async (data: { orderID: string }) => {
    const res = await approvePayPalOrder(order.id, data);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    toast.success(res.message);
  };

  return (
    <>
      <h1 className='py-4 text-2xl'> Order {formatId(order.id)}</h1>
      <div className='grid md:grid-cols-3 md:gap-5'>
        <div className='space-y-4 overflow-x-auto md:col-span-2'>
          <Card>
            <CardContent className='gap-4 p-4'>
              <h2 className='pb-4 text-xl'>Payment Method</h2>
              <p>{paymentMethod}</p>
              {isPaid ? (
                <Badge variant='secondary'>
                  Paid at {formatDateTime(paidAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant='destructive'>Not paid</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className='gap-4 p-4'>
              <h2 className='pb-4 text-xl'>Shipping Address</h2>
              <p>{shippingAddress.fullName}</p>
              <p>
                {shippingAddress.streetAddress}, {shippingAddress.city},{' '}
                {shippingAddress.postalCode}, {shippingAddress.country}{' '}
              </p>
              {isDelivered ? (
                <Badge variant='secondary'>
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </Badge>
              ) : (
                <Badge variant='destructive'>Not delivered</Badge>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className='gap-4 p-4'>
              <h2 className='pb-4 text-xl'>Order Items</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItem.map((item) => (
                    <TableRow key={item.slug}>
                      <TableCell>
                        <Link
                          href={`/product/${item.slug}`}
                          className='flex items-center'
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={50}
                            height={50}
                          ></Image>
                          <span className='px-2'>{item.name}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className='px-2'>{item.qty}</span>
                      </TableCell>
                      <TableCell className='text-right'>
                        ${item.price}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className='gap-4 space-y-4 p-4'>
              <h2 className='pb-4 text-xl'>Order Summary</h2>
              <div className='flex justify-between'>
                <div>Items</div>
                <div>{formatCurrency(itemsPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Tax</div>
                <div>{formatCurrency(taxPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Shipping</div>
                <div>{formatCurrency(shippingPrice)}</div>
              </div>
              <div className='flex justify-between'>
                <div>Total</div>
                <div>{formatCurrency(totalPrice)}</div>
              </div>
              {!isPaid && paymentMethod === 'PayPal' && (
                <div>
                  <PayPalScriptProvider options={{ clientId: paypalClientId }}>
                    <PrintLoadingState />
                    <PayPalButtons
                      createOrder={handleCreatePayPalOrder}
                      onApprove={handleApprovePayPalOrder}
                    />
                  </PayPalScriptProvider>
                </div>
              )}
              {isAdmin && !isPaid && paymentMethod === 'CashOnDelivery' && (
                <MarkAsPaidButton orderId={order.id} />
              )}
              {isAdmin && isPaid && !isDelivered && (
                <MarkAsDeliveredButton orderId={order.id} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};
