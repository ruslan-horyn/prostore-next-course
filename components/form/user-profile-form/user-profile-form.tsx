'use client';

import { updateProfileSchema } from '@/lib/validators';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSession } from 'next-auth/react';
import { z } from 'zod';
import { usePaymentMethodForm } from './useUserProfileForm';
import { SubmitHandler } from 'react-hook-form';
import { updateProfile } from '@/lib/actions/user.actions';
import { toast } from 'sonner';

export const UserProfileForm = () => {
  const { data: session, update } = useSession();

  const form = usePaymentMethodForm();

  const onSubmit: SubmitHandler<z.infer<typeof updateProfileSchema>> = async (
    values
  ) => {
    const res = await updateProfile(values);
    if (!res.success) {
      toast.error(res.message);
      return;
    }

    await update({
      ...session,
      user: { ...session?.user, name: values.name },
    });
    toast.success(res.message);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='flex flex-col gap-5'
      >
        <div className='flex flex-col gap-5'>
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    disabled
                    placeholder='Email'
                    className='input-field'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormControl>
                  <Input
                    {...field}
                    placeholder='Name'
                    className='input-field'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type='submit'
          size='lg'
          disabled={form.formState.isSubmitting}
          className='button col-span-2 w-full'
        >
          {form.formState.isSubmitting ? 'Submitting...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
};
