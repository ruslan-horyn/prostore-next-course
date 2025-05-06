import type { Cart, CartItem } from '@/types/cart';
import {
  PRICE_FOR_FREE_SHIPPING,
  SHIPPING_PRICE,
  TAX_RATE,
} from '../constants';
import { roundTwo } from '../utils';

export const calculateCartPrise = (
  items: CartItem[]
): Pick<Cart, 'itemsPrice' | 'shippingPrice' | 'taxPrice' | 'totalPrice'> => {
  const itemsPrise = roundTwo(
    items.reduce((acc, item) => acc + Number(item.price) * Number(item.qty), 0)
  );
  const shippingPrice = roundTwo(
    itemsPrise > PRICE_FOR_FREE_SHIPPING ? 0 : SHIPPING_PRICE
  );
  const taxPrice = roundTwo(itemsPrise * TAX_RATE);
  const totalPrice = roundTwo(itemsPrise + shippingPrice + taxPrice);

  return {
    itemsPrice: itemsPrise.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice: taxPrice.toFixed(2),
    totalPrice: totalPrice.toFixed(2),
  };
};
