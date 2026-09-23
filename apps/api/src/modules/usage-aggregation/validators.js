import { z } from 'zod';

/**
 * Validation schemas for usage aggregation
 */

export const aggregateUsageSchema = z.object({
  customerId: z.string().cuid('Invalid customer ID'),
  meterId: z.string().cuid('Invalid meter ID'),
  periodStart: z.string().datetime('Invalid ISO 8601 datetime'),
  periodEnd: z.string().datetime('Invalid ISO 8601 datetime'),
});

export const queryAggregatesSchema = z.object({
  customerId: z.string().cuid().optional(),
  meterId: z.string().cuid().optional(),
  periodStart: z.string().datetime().optional(),
  periodEnd: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
