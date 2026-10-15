import { z } from 'zod';

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1),
  number: z.string().min(1),
  currency: z.string().length(3).toUpperCase().default('USD'),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  dueAt: z.string().datetime().nullable().optional(),
  lines: z
    .array(
      z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        unitAmountMinor: z.number().int(),
        metadata: z.record(z.unknown()).nullable().optional(),
      })
    )
    .min(1),
});

export const updateInvoiceSchema = z
  .object({
    status: z.enum(['DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE']).optional(),
    dueAt: z.string().datetime().nullable().optional(),
    issuedAt: z.string().datetime().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field required' });

export const listInvoicesSchema = z.object({
  customerId: z.string().optional(),
  status: z.enum(['DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
