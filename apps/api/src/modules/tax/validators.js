import { z } from 'zod';

export const createTaxRateSchema = z.object({
  name: z.string().min(1),
  rate: z.number().positive().max(100),
  country: z.string().length(2),
  region: z.string().optional(),
  active: z.boolean().optional(),
});

export const updateTaxRateSchema = createTaxRateSchema.partial();

export const taxRateIdSchema = z.object({ id: z.string().cuid() });

export const calculateTaxSchema = z.object({
  amountMinor: z.number().int().nonnegative(),
  country: z.string().length(2),
  region: z.string().optional(),
});

export const applyTaxSchema = z.object({
  country: z.string().length(2),
  region: z.string().optional(),
});
