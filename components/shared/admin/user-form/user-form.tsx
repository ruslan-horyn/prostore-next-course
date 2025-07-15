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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { updateUser } from '@/lib/actions/user.actions';
import { USER_ROLES } from '@/lib/constants';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { type UserFormSchemaType, useUserForm } from './useUserForm';

export const UserForm = ({ user }: { user: UserFormSchemaType }) => {
  const router = useRouter();
  const formMethods = useUserForm(user);
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = formMethods;

  const onSubmit: SubmitHandler<UserFormSchemaType> = async (data) => {
    const res = await updateUser({ ...data, id: user.id });
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      router.push(`/admin/users`);
    }
  };

  return (
    <Form {...formMethods}>
      <form
        method='post'
        onSubmit={handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <FormField
          control={control}
          name='name'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter user name' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='email'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input disabled placeholder='Enter user email' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name='role'
          render={({ field }) => (
            <FormItem className='w-full'>
              <FormLabel>Role</FormLabel>
              <FormControl>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder='Select a role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(USER_ROLES).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isSubmitting} className='w-full'>
          {isSubmitting && <Loader className='h-4 w-4 animate-spin' />}
          Update User
        </Button>
      </form>
    </Form>
  );
};
