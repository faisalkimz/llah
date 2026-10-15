import { z } from 'zod';

export const createPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  active: z.boolean().default(true),
  items: z
    .array(
      z.object({
        priceId: z.string().min(1),
        sortOrder: z.number().int().min(0).default(0),
      })
    )
    .default([]),
});

export const updatePlanSchema = z
  .object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'At least one field required' });

export const addPlanItemSchema = z.object({
  priceId: z.string().min(1),
  sortOrder: z.number().int().min(0).default(0),
});

export const listPlansSchema = z.object({
  active: z
    .string()
    .transform((v) => v === 'true')
    .pipe(z.boolean())
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
