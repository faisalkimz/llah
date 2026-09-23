import { z } from 'zod';

/**
 * Validation schemas for usage event operations
 */

/**
 * Ingest usage event payload
 */
export const ingestEventSchema = z.object({
  idempotencyKey: z.string().trim().min(1, 'Idempotency key is required').max(255),
  customerId: z.string().cuid('Invalid customer ID'),
  meterId: z.string().cuid('Invalid meter ID'),
  quantity: z.number().positive('Quantity must be positive'),
  eventAt: z.string().datetime('Invalid ISO 8601 datetime').or(z.date()),
  properties: z.record(z.unknown()).optional(),
});

/**
 * Query parameters for listing usage events
 */
export const listEventsQuerySchema = z.object({
  customerId: z.string().cuid().optional(),
  meterId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(1000).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

/**
 * Usage event ID parameter validation
 */
export const eventIdSchema = z.object({
  id: z.string().cuid('Invalid event ID'),
});
