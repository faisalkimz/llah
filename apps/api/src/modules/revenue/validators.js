import { z } from 'zod';

export const periodQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  granularity: z.enum(['day', 'week', 'month']).default('month'),
});

export const churnQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});
