import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Payment Method',
};

const PaymentMethodPage = async () => {
  return (
    <>
      {/* <PaymentMethodForm />; */}
      <h1>Payment Method Page</h1>
    </>
  );
};

export default PaymentMethodPage;
