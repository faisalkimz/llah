import { z } from 'zod';

export const createPaymentSchema = z.object({
  invoiceId: z.string().nullable().optional(),
  provider: z.string().min(1),
  providerPaymentId: z.string().nullable().optional(),
  currency: z.string().length(3).toUpperCase().default('USD'),
  amountMinor: z.number().int().positive(),
});

export const updatePaymentSchema = z
  .object({
    status: z.enum(['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED']).optional(),
    providerPaymentId: z.string().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field required' });

export const listPaymentsSchema = z.object({
  invoiceId: z.string().optional(),
  status: z.enum(['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
