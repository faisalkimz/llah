import { Router } from 'express';
import * as service from './service.js';
import { requireAuth } from '../../middleware/auth.js';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  organizationIdSchema,
  membershipIdSchema,
} from './validators.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

/**
 * POST /organizations
 * Create a new organization
 */
router.post('/', async (req, res, next) => {
  try {
    const validation = createOrganizationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const result = await service.createOrganization(req.user.id, validation.data);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /organizations
 * Get all organizations for the current user
 */
router.get('/', async (req, res, next) => {
  try {
    const organizations = await service.getUserOrganizations(req.user.id);
    res.json({ data: organizations });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /organizations/:id
 * Get organization by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const paramValidation = organizationIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const organization = await service.getOrganization(req.user.id, req.params.id);
    res.json({ data: organization });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /organizations/:id
 * Update organization
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const paramValidation = organizationIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const validation = updateOrganizationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const organization = await service.updateOrganization(
      req.user.id,
      req.params.id,
      validation.data
    );

    res.json({ data: organization });
  } catch (error) {
    if (error.message.includes('Insufficient permissions')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * DELETE /organizations/:id
 * Delete organization (owner only)
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const paramValidation = organizationIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    await service.deleteOrganization(req.user.id, req.params.id);
    res.json({ data: { success: true } });
  } catch (error) {
    if (error.message.includes('Only organization owner')) {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /organizations/:id/members
 * Get all members of an organization
 */
router.get('/:id/members', async (req, res, next) => {
  try {
    const paramValidation = organizationIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const members = await service.getOrganizationMembers(req.user.id, req.params.id);
    res.json({ data: members });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return res.status(404).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * POST /organizations/:id/members
 * Invite a member to the organization
 * Note: For now, this requires the user to already exist. 
 * Email-based invitations would be added in a future enhancement.
 */
router.post('/:id/members', async (req, res, next) => {
  try {
    const paramValidation = organizationIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: 'Invalid organization ID' });
    }

    const validation = inviteMemberSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    // TODO: In production, this would send an email invitation
    // For now, we need to find the user by email first
    const { prisma } = await import('../../lib/prisma.js');
    const inviteeUser = await prisma.user.findUnique({
      where: { email: validation.data.email },
    });

    if (!inviteeUser) {
      return res.status(404).json({
        error: 'User not found. They need to create an account first.',
      });
    }

    const membership = await service.inviteMember(
      req.user.id,
      req.params.id,
      inviteeUser.id,
      validation.data.role
    );

    res.status(201).json({ data: membership });
  } catch (error) {
    if (error.message.includes('Insufficient permissions')) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('already a member')) {
      return res.status(409).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /memberships/:id
 * Update member role
 */
router.patch('/memberships/:id', async (req, res, next) => {
  try {
    const paramValidation = membershipIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: 'Invalid membership ID' });
    }

    const validation = updateMemberRoleSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validation.error.errors,
      });
    }

    const membership = await service.updateMemberRole(
      req.user.id,
      req.params.id,
      validation.data.role
    );

    res.json({ data: membership });
  } catch (error) {
    if (
      error.message.includes('Insufficient permissions') ||
      error.message.includes('cannot change your own role') ||
      error.message.includes('Only organization owner')
    ) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Cannot remove the last owner')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * DELETE /memberships/:id
 * Remove member from organization
 */
router.delete('/memberships/:id', async (req, res, next) => {
  try {
    const paramValidation = membershipIdSchema.safeParse(req.params);
    if (!paramValidation.success) {
      return res.status(400).json({ error: 'Invalid membership ID' });
    }

    await service.removeMember(req.user.id, req.params.id);
    res.json({ data: { success: true } });
  } catch (error) {
    if (
      error.message.includes('Insufficient permissions') ||
      error.message.includes('Only organization owner')
    ) {
      return res.status(403).json({ error: error.message });
    }
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    if (error.message.includes('Cannot remove the last owner')) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

export default router;
