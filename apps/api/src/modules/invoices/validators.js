import { z } from 'zod';

// Note: `number` and `subtotalMinor`/`totalMinor` are computed server-side.
// Callers supply line items; the service computes totals and sequences the number.
export const createInvoiceSchema = z.object({
  customerId: z.string().min(1),
  currency: z.string().length(3).toUpperCase().default('USD'),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  dueAt: z.string().datetime().nullable().optional(),
  lines: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().int().positive(),
        unitAmountMinor: z.number().int(),
        metadata: z.record(z.unknown()).nullable().optional(),
      })
    )
    .min(1, 'Invoice must have at least one line item'),
});

export const updateInvoiceSchema = z
  .object({
    dueAt: z.string().datetime().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field required' });

export const listInvoicesSchema = z.object({
  customerId: z.string().optional(),
  status: z.enum(['DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
