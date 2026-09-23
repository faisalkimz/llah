import { z } from 'zod';

/**
 * Validation schemas for customer operations
 */

// Phone validation: optional, but if provided must be reasonable format
const phoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(20)
  .regex(/^[+\d\s\-().]+$/, 'Invalid phone format')
  .optional();

// Email validation: optional, but if provided must be valid
const emailSchema = z
  .string()
  .trim()
  .email('Invalid email address')
  .max(255)
  .optional();

// Postal code validation: flexible international format
const postalCodeSchema = z
  .string()
  .trim()
  .min(2)
  .max(20)
  .optional();

/**
 * Create customer payload
 */
export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  email: emailSchema,
  phone: phoneSchema,
  externalId: z.string().trim().min(1).max(255).optional(),
  addressLine1: z.string().trim().max(255).optional(),
  addressLine2: z.string().trim().max(255).optional(),
  city: z.string().trim().max(100).optional(),
  state: z.string().trim().max(100).optional(),
  postalCode: postalCodeSchema,
  country: z.string().trim().max(100).optional(),
  metadata: z.record(z.unknown()).optional(),
});

/**
 * Update customer payload (all fields optional except must have at least one)
 */
export const updateCustomerSchema = z
  .object({
    name: z.string().trim().min(1).max(255).optional(),
    email: emailSchema,
    phone: phoneSchema,
    externalId: z.string().trim().min(1).max(255).optional(),
    addressLine1: z.string().trim().max(255).optional(),
    addressLine2: z.string().trim().max(255).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    postalCode: postalCodeSchema,
    country: z.string().trim().max(100).optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

/**
 * Query parameters for listing/searching customers
 */
export const listCustomersQuerySchema = z.object({
  search: z.string().trim().max(255).optional(),
  email: z.string().trim().email().max(255).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  sortBy: z.enum(['name', 'email', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

/**
 * Customer ID parameter validation
 */
export const customerIdSchema = z.object({
  id: z.string().cuid('Invalid customer ID'),
});

/**
 * Organization ID parameter validation
 */
export const orgIdSchema = z.object({
  organizationId: z.string().cuid('Invalid organization ID'),
});
