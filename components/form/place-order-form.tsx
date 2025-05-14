'use client';
import { Check, Loader } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { createOrder } from '@/lib/actions/order';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const PlaceOrderButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className='w-full'>
      {pending ? (
        <Loader className='h-4 w-4 animate-spin' />
      ) : (
        <Check className='h-4 w-4' />
      )}{' '}
      Place Order
    </Button>
  );
};

export const PlaceOrderForm = () => {
  const router = useRouter();

  const handleSubmit = async () => {
    const res = await createOrder();

    if (res.success && res.redirectTo) {
      router.push(res.redirectTo);
    }
    if (!res.success) {
      toast.error(res.message);
    }
  };

  return (
    <form action={handleSubmit} className='w-full'>
      <PlaceOrderButton />
    </form>
  );
};
