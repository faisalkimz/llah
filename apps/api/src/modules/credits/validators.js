import { z } from 'zod';

export const createCreditGrantSchema = z.object({
  customerId: z.string().min(1),
  currency: z.string().length(3).toUpperCase().default('USD'),
  amountMinor: z.number().int().positive(),
  reason: z.string().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const listCreditGrantsSchema = z.object({
  customerId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const applyCreditSchema = z.object({
  invoiceId: z.string().min(1),
  amountToApplyMinor: z.number().int().positive()
});
