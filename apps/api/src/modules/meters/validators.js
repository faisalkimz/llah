import { z } from 'zod';

/**
 * Validation schemas for meter operations
 */

// Meter key validation: snake_case identifier
const meterKeySchema = z
  .string()
  .trim()
  .min(1, 'Meter key is required')
  .max(100)
  .regex(/^[a-z][a-z0-9_]*$/, 'Meter key must start with a letter and contain only lowercase letters, numbers, and underscores');

// Aggregation type validation
const aggregationSchema = z.enum([
  'SUM',      // Sum all values (e.g., total API calls)
  'COUNT',    // Count events (e.g., number of transactions)
  'MAX',      // Maximum value in period (e.g., peak concurrent users)
  'LATEST',   // Most recent value (e.g., current storage amount)
], {
  errorMap: () => ({ message: 'Aggregation must be one of: SUM, COUNT, MAX, LATEST' })
});

/**
 * Create meter payload
 */
export const createMeterSchema = z.object({
  key: meterKeySchema,
  name: z.string().trim().min(1, 'Name is required').max(255),
  unit: z.string().trim().min(1, 'Unit is required').max(50),
  aggregation: aggregationSchema.optional().default('SUM'),
});

/**
 * Update meter payload (all fields optional except must have at least one)
 */
export const updateMeterSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    unit: z.string().trim().min(1).max(50).optional(),
    aggregation: aggregationSchema.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

/**
 * Query parameters for listing/searching meters
 */
export const listMetersQuerySchema = z.object({
  search: z.string().trim().max(255).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z.enum(['name', 'key', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Meter ID parameter validation
 */
export const meterIdSchema = z.object({
  id: z.string().cuid('Invalid meter ID'),
});
