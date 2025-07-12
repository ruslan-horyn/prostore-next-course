'use client';

import { productDefaultValues } from '@/lib/constants';
import { insertProductSchema, updateProductSchema } from '@/lib/validators';

import { Product } from '@/types/product';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type ProductFormType = 'Create' | 'Update';
export type ProductFormSchemaType =
  | z.infer<typeof updateProductSchema>
  | z.infer<typeof insertProductSchema>;

export const useProductForm = (type: ProductFormType, product?: Product) => {
  const isUpdate = type === 'Update';

  return useForm<ProductFormSchemaType>({
    resolver: zodResolver(isUpdate ? updateProductSchema : insertProductSchema),
    defaultValues: {
      ...productDefaultValues,
      ...product,
    },
  });
};
