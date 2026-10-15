import { z } from 'zod';

export const createRefundSchema = z.object({
  paymentId: z.string().min(1),
  amountMinor: z.number().int().positive(),
  reason: z.string().nullable().optional(),
  providerRefundId: z.string().nullable().optional(),
});

export const listRefundsSchema = z.object({
  paymentId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
