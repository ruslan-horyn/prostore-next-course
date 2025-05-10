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
import { Input } from '@/components/ui/input';
import type { ShippingAddress } from '@/types/shipping-address';
import { ArrowRight, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { type SubmitHandler } from 'react-hook-form';
import { useShippingAddressForm } from './useShippingAddressForm';

export const ShippingAddressForm = ({
  address,
}: {
  address: ShippingAddress | null;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useShippingAddressForm({ address });

  const onSubmit: SubmitHandler<ShippingAddress> = (data) => {
    console.log(data);
  };

  return (
    <div className='mx-auto max-w-md space-y-4'>
      <h1 className='h2-bold mt-4'>Shipping Address</h1>
      <p className='text-muted-foreground text-sm'>
        Please enter the address that you want to ship to
      </p>
      <Form {...form}>
        <form
          method='post'
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-4'
        >
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter full name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div>
            <FormField
              control={form.control}
              name='streetAddress'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter address' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className='flex flex-col gap-5 md:flex-row'>
            <FormField
              control={form.control}
              name='city'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter city' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='country'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter country' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='postalCode'
              render={({ field }) => (
                <FormItem className='w-full'>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter postal code' {...field} />
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
