import { z } from 'zod';

export const createAdjustmentSchema = z.object({
  customerId: z.string().min(1),
  invoiceId: z.string().min(1).optional(),
  type: z.enum(['CREDIT', 'DEBIT']),
  currency: z.string().length(3).toUpperCase().default('USD'),
  // amountMinor must be a non-zero integer (validated further in service)
  amountMinor: z.number().int().refine((v) => v !== 0, { message: 'amountMinor must not be zero' }),
  reason: z.string().min(1),
  referenceType: z.string().nullable().optional(),
  referenceId: z.string().nullable().optional(),
});

export const listAdjustmentsSchema = z.object({
  customerId: z.string().optional(),
  type: z.enum(['DEBIT', 'CREDIT']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
