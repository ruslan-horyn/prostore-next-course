'use client';

import { formFieldsDefaultValues } from '@/lib/constants';
import { shippingAddressSchema } from '@/lib/validators';
import type { ShippingAddress } from '@/types/shipping-address';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const useShippingAddressForm = ({
  address,
}: {
  address: ShippingAddress | null;
}) => {
  const form = useForm<ShippingAddress>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || formFieldsDefaultValues.shippingAddress,
  });

  return form;
};
