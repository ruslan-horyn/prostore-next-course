'use client';
import { Button } from '@/components/ui/button';
import { addItemToCart, removeItemFromCart } from '@/lib/actions/card';
import { Cart, CartItem } from '@/types/cart';
import { Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const AddToCart = ({ item, card }: { item: CartItem; card?: Cart }) => {
  const router = useRouter();

  const existingItem = card?.items.find((i) => i.productId === item.productId);

  const handleAddToCart = async () => {
    const res = await addItemToCart(item);
    if (!res.success) {
      toast.error(res.message);
    }
    if (res.success) {
      toast.success(res.message, {
        action: {
          label: 'Go to cart',
          onClick: () => router.push('/cart'),
        },
      });
    }
  };

  const handleRemoveFromCart = async () => {
    const res = await removeItemFromCart(item.productId);
    if (!res.success) {
      toast.error(res.message);
    }
    if (res.success) {
      toast.success(res.message);
    }
  };

  if (existingItem) {
    return (
      <div className='flex w-full items-center justify-center gap-2'>
        <Button
          variant='outline'
          size='icon'
          type='button'
          onClick={handleRemoveFromCart}
        >
          <Minus className='h-4 w-4' />
        </Button>
        <p>{existingItem.qty}</p>
        <Button
          variant='outline'
          size='icon'
          type='button'
          onClick={handleAddToCart}
        >
          <Plus className='h-4 w-4' />
        </Button>
      </div>
    );
  }

  return (
    <Button className='w-full' type='button' onClick={handleAddToCart}>
      <Plus className='h-4 w-4' />
      Add to cart
    </Button>
  );
};
