'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { updateUserPaymentMethod } from '@/lib/actions/user.actions';
import { envs } from '@/lib/constants';
import { PaymentMethod } from '@/types/payment-method';
import { ArrowRight, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { usePaymentMethodForm } from './usePaymentMethodForm';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const PaymentMethodForm = ({
  preferredPaymentMethod,
}: {
  preferredPaymentMethod: string | null;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = usePaymentMethodForm({ preferredPaymentMethod });

  const onSubmit: SubmitHandler<PaymentMethod> = (values) => {
    startTransition(async () => {
      updateUserPaymentMethod(values)
        .then((res) => {
          if (!res.success) {
            toast.error(res.message);
            return;
          }

          router.push('/place-order');
        })
        .catch((err) => {
          toast.error(err.message);
        });
    });
  };

  return (
    <div className='mx-auto max-w-md'>
      <Form {...form}>
        <form
          method='post'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <h1 className='h2-bold mt-4'>Payment Method</h1>
          <p className='text-muted-foreground text-sm'>
            Please select your preferred payment method
          </p>
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='type'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      className='flex flex-col space-y-2'
                    >
                      {envs.PAYMENT_METHODS.map((paymentMethod) => (
                        <FormItem
                          key={paymentMethod}
                          className='flex items-center space-y-0 space-x-3'
                        >
                          <FormControl>
                            <RadioGroupItem
                              value={paymentMethod}
                              checked={field.value === paymentMethod}
                            />
                          </FormControl>
                          <FormLabel className='font-normal'>
                            {paymentMethod}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex gap-2'>
            <Button type='submit' disabled={isPending}>
              {isPending ? (
                <Loader className='h-4 w-4 animate-spin' />
              ) : (
                <ArrowRight className='h-4 w-4' />
              )}
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
