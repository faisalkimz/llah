import { z } from 'zod';

export const createPriceSchema = z.object({
  productId: z.string().cuid('Invalid product ID'),
  meterId: z.string().cuid().optional(),
  name: z.string().trim().min(1, 'Name is required').max(255),
  currency: z.string().length(3).default('USD'),
  billingScheme: z.enum(['flat', 'per_unit', 'tiered']),
  unitAmountMinor: z.number().int().min(0).optional(),
  tiers: z.array(z.object({
    upTo: z.number().int().positive().optional(),
    unitAmountMinor: z.number().int().min(0),
  })).optional(),
  active: z.boolean().optional().default(true),
});

export const updatePriceSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const listPricesQuerySchema = z.object({
  productId: z.string().cuid().optional(),
  meterId: z.string().cuid().optional(),
  active: z.enum(['true', 'false']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

export const priceIdSchema = z.object({
  id: z.string().cuid('Invalid price ID'),
});
