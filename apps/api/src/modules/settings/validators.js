import { z } from 'zod';

export const keyParamSchema = z.object({
  key: z.string().min(1),
});

export const setValueSchema = z.object({
  value: z.unknown(),
});

export const listQuerySchema = z.object({});
