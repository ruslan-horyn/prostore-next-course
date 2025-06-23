import { auth } from '@/auth';
import { OrderDetailsTable } from '@/components/order/order-details-table';
import { getOrderById } from '@/lib/actions/order';
import { USER_ROLES } from '@/lib/constants';
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

  const session = await auth();
  const isAdmin = session?.user?.role === USER_ROLES.ADMIN;

  return (
    <OrderDetailsTable
      order={order}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || 'sb'}
      isAdmin={isAdmin}
    />
  );
};

export default OrderDetailsPage;
