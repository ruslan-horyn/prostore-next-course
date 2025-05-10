import { CartTable } from '@/components/cart/cart-table';
import { getMyCard } from '@/lib/card/get-my-card';

export const metadata = {
  title: 'Shopping Cart',
};

const CartPage = async () => {
  const cart = await getMyCard();

  return <CartTable cart={cart} />;
};

export default CartPage;
