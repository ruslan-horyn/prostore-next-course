import { CartTable } from '@/components/cart/cart-table';
import { getMyCart } from '@/lib/cart/get-my-cart';

export const metadata = {
  title: 'Shopping Cart',
};

const CartPage = async () => {
  const cart = await getMyCart();

  return <CartTable cart={cart} />;
};

export default CartPage;
