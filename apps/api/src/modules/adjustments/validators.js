import { z } from 'zod';

export const createAdjustmentSchema = z.object({
  customerId: z.string().min(1),
  type: z.enum(['DEBIT', 'CREDIT']),
  currency: z.string().length(3).toUpperCase().default('USD'),
  amountMinor: z.number().int().positive(),
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
