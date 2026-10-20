import { z } from 'zod';

export const listQuerySchema = z.object({
  jobName: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const jobNameParamSchema = z.object({
  jobName: z.string().min(1),
});

export const subscriptionIdSchema = z.object({
  subscriptionId: z.string().min(1),
});

export const reportIdParamSchema = z.object({
  reportId: z.string().min(1),
});

export const jobIdSchema = z.object({
  id: z.string().min(1),
});
