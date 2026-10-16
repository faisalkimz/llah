import { z } from 'zod';

export const createReportSchema = z.object({
  type: z.enum([
    'INVOICE_SUMMARY',
    'REVENUE_SUMMARY',
    'SUBSCRIPTION_SUMMARY',
    'USAGE_SUMMARY',
    'TAX_SUMMARY',
  ]),
  parameters: z.record(z.unknown()).optional(),
});

export const reportIdSchema = z.object({
  id: z.string().cuid(),
});
