import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  customerId: z.string().min(1),
  planId: z.string().min(1),
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
});

export const updateSubscriptionSchema = z
  .object({
    planId: z.string().min(1).optional(),
    status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED']).optional(),
    currentPeriodStart: z.string().datetime().optional(),
    currentPeriodEnd: z.string().datetime().optional(),
    cancelAtPeriodEnd: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field required' });

export const listSubscriptionsSchema = z.object({
  customerId: z.string().optional(),
  status: z.enum(['ACTIVE', 'PAST_DUE', 'CANCELED', 'PAUSED']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
