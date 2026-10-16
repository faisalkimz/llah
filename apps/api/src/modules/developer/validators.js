import { z } from 'zod';

export const apiStatsQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});
