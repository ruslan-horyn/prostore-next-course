'use client';
import { Button } from '@/components/ui/button';
import { addItemToCart } from '@/lib/actions/add-item-to-cart.actions';
import { useRouter } from 'next/navigation';
import { Plus, Loader } from 'lucide-react';
import { CartItem } from '@/types/cart';
import { toast } from 'sonner';
import { useActionState, useEffect } from 'react';

export const AddToCart = ({ item }: { item: CartItem }) => {
  const router = useRouter();
  const [state, action, isPending] = useActionState(() => addItemToCart(item), {
    success: false,
    isSubmitted: false,
    message: '',
  });

  useEffect(() => {
    if (!state.isSubmitted) {
      return undefined;
    }
    if (!state.success) {
      toast.error(state.message);
    }
    if (state.success) {
      toast.success(state.message, {
        duration: 1000000,
        action: {
          label: 'Go to cart',
          onClick: () => router.push('/cart'),
        },
      });
    }
  }, [router, state]);

  return (
    <form action={action}>
      <Button className='w-full' type='submit' disabled={isPending}>
        {isPending && <Loader className='h-4 w-4 animate-spin' />}
        {!isPending && <Plus className='h-4 w-4' />}
        Add To Cart
      </Button>
    </form>
  );
};
