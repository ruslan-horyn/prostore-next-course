"use server";

import { CartItem } from "@/types/cart";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const addItemToCart = async (data: CartItem) => {
  return Promise.resolve({
    success: true,
    isSubmitted: true,
    message: "Item added to the cart",
  });
};
