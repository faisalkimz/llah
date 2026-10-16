import { z } from 'zod';

export const flagKeySchema = z.object({
  key: z.string().regex(/^[a-z0-9_-]+$/),
});

export const setFlagSchema = z.object({
  enabled: z.boolean(),
  description: z.string().optional(),
});
