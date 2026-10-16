import { z } from 'zod';

export const logEventSchema = z.object({
  action: z.string().min(1),
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const listEventsQuerySchema = z.object({
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  actorId: z.string().optional(),
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export const eventStatsQuerySchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
});

export const eventIdSchema = z.object({
  id: z.string().cuid(),
});
