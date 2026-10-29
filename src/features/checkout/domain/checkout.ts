import { z } from 'zod';
import { MAX_PER_BOOK } from '@/features/catalog/domain/book';
import type { DeliverySettings } from '@/features/settings/domain/settings';

export const checkoutInput = z.object({
  lines: z
    .array(z.object({ id: z.string().min(1).max(120), qty: z.number().int().min(1).max(MAX_PER_BOOK) }))
    .min(1)
    .max(50),
  name: z.string().trim().min(2).max(100),
  email: z.email().max(150),
  phone: z.string().trim().min(6).max(40),
  zone: z.enum(['lome', 'outside']),
  street: z.string().trim().min(3).max(300),
  area: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  note: z.string().trim().max(500).default(''),
  paymentMethod: z.enum(['mobile_money', 'card', 'cash_on_delivery']),
});

export type CheckoutInput = z.infer<typeof checkoutInput>;

export function deliveryFee(zone: 'lome' | 'outside', delivery: Pick<DeliverySettings, 'lome' | 'outside'>): number {
  return zone === 'lome' ? delivery.lome : delivery.outside;
}

export class CheckoutError extends Error {
  constructor(
    readonly reason: 'unavailable' | 'stock' | 'method' | 'empty',
    readonly bookId?: string,
  ) {
    super(reason);
  }
}
