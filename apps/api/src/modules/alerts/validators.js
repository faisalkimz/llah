import { z } from 'zod';

export const createAlertRuleSchema = z.object({
  name: z.string().min(1),
  metric: z.enum([
    'USAGE_AMOUNT',
    'INVOICE_OVERDUE_DAYS',
    'PAYMENT_FAILURE_COUNT',
    'MRR_DROP_PERCENT',
  ]),
  threshold: z.number(),
  operator: z.enum(['GT', 'GTE', 'LT', 'LTE']).default('GT'),
  active: z.boolean().optional(),
});

export const updateAlertRuleSchema = createAlertRuleSchema.partial();

export const alertRuleIdSchema = z.object({
  id: z.string().cuid(),
});

export const firingIdSchema = z.object({
  id: z.string().cuid(),
});
