import { z } from 'zod';

export const createApiKeySchema = z.object({
  name: z.string().min(1),
});

export const listApiKeysSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
