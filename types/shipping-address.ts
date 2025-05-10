import { shippingAddressSchema } from '@/lib/validators';
import { z } from 'zod';

export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
