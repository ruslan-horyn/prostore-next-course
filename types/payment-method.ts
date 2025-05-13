import { z } from 'zod';
import { paymentMethodSchema } from '@/lib/validators';

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
