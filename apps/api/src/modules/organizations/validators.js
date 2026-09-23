import { z } from 'zod';

/**
 * Validators for organizations and memberships
 */

// Slug must be URL-safe: lowercase letters, numbers, hyphens only
const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(63, 'Slug must be less than 64 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
  .regex(/^[a-z]/, 'Slug must start with a letter')
  .regex(/[a-z0-9]$/, 'Slug must end with a letter or number');

// Organization name validation
const organizationNameSchema = z
  .string()
  .min(1, 'Organization name is required')
  .max(100, 'Organization name must be less than 100 characters')
  .trim();

// Create organization request
const createOrganizationSchema = z.object({
  name: organizationNameSchema,
  slug: slugSchema.optional(), // Auto-generated from name if not provided
});

// Update organization request
const updateOrganizationSchema = z.object({
  name: organizationNameSchema.optional(),
  slug: slugSchema.optional(),
}).refine((data) => data.name || data.slug, {
  message: 'At least one field must be provided',
});

// Membership role validation
const membershipRoleSchema = z.enum([
  'OWNER',
  'ADMIN',
  'BILLING',
  'DEVELOPER',
  'ANALYST',
  'VIEWER',
], {
  errorMap: () => ({ message: 'Invalid role' }),
});

// Invite member request
const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: membershipRoleSchema.default('VIEWER'),
});

// Update member role request
const updateMemberRoleSchema = z.object({
  role: membershipRoleSchema,
});

// Organization ID parameter
const organizationIdSchema = z.object({
  id: z.string().cuid('Invalid organization ID'),
});

// Membership ID parameter
const membershipIdSchema = z.object({
  id: z.string().cuid('Invalid membership ID'),
});

export {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  organizationIdSchema,
  membershipIdSchema,
  slugSchema,
  membershipRoleSchema,
};
