import { OrderDetailsTable } from '@/components/order/order-details-table';
import { getOrderById } from '@/lib/actions/order';
import { notFound } from 'next/navigation';

export const metadata = {
  title: 'Order Details',
};

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const { id } = params;

  const order = await getOrderById(id);
  if (!order) notFound();

  return <OrderDetailsTable order={order} />;
};

export default OrderDetailsPage;
