import { auth } from '@/auth';
import { PaymentMethodForm } from '@/components/form/payment-method-form';
import { CheckoutSteps } from '@/components/shared/checkout-steps';
import { getUserById } from '@/lib/actions/user.actions';
import { getMyCart } from '@/lib/cart/get-my-cart';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Payment Method',
};

const PaymentMethodPage = async () => {
  const cart = await getMyCart();

  if (!cart || cart.items.length === 0) redirect('/cart');

  const session = await auth();

  const userId = session?.user?.id;

  if (!userId) {
    throw new Error('User ID not found');
  }

  const user = await getUserById(userId);

  return (
    <>
      <CheckoutSteps current={2} />
      <PaymentMethodForm preferredPaymentMethod={user.paymentMethod} />;
    </>
  );
};

export default PaymentMethodPage;
