'use client';

import { updateUserSchema } from '@/lib/validators';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type UserFormSchemaType = z.infer<typeof updateUserSchema>;

export const useUserForm = (user: UserFormSchemaType) => {
  return useForm<UserFormSchemaType>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: user,
  });
};
