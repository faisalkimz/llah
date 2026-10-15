import { z } from 'zod';

export const createLedgerEntrySchema = z.object({
  customerId: z.string().nullable().optional(),
  type: z.enum(['CHARGE', 'PAYMENT', 'CREDIT', 'REFUND', 'ADJUSTMENT']),
  currency: z.string().length(3).toUpperCase().default('USD'),
  amountMinor: z.number().int(),
  referenceType: z.string().nullable().optional(),
  referenceId: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

export const listLedgerEntriesSchema = z.object({
  customerId: z.string().optional(),
  type: z.enum(['CHARGE', 'PAYMENT', 'CREDIT', 'REFUND', 'ADJUSTMENT']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
