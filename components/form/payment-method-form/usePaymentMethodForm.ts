'use client';

import { envs } from '@/lib/constants';
import { paymentMethodSchema } from '@/lib/validators';
import type { PaymentMethod } from '@/types/payment-method';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

export const usePaymentMethodForm = ({
  preferredPaymentMethod,
}: {
  preferredPaymentMethod: string | null;
}) => {
  const form = useForm<PaymentMethod>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: preferredPaymentMethod || envs.DEFAULT_PAYMENT_METHOD,
    },
  });

  return form;
};
