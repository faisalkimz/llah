import * as orgRepository from './repository.js';
import * as membershipRepository from './membership-repository.js';
import { slugSchema } from './validators.js';

/**
 * Organization and membership business logic
 */

/**
 * Generate a URL-safe slug from a name
 * @param {string} name - Organization name
 * @returns {string} URL-safe slug
 */
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 63); // Max length
}

/**
 * Ensure slug is unique by appending numbers if needed
 * @param {string} baseSlug - Base slug
 * @param {string} [excludeOrgId] - Organization ID to exclude (for updates)
 * @returns {Promise<string>} Unique slug
 */
async function ensureUniqueSlug(baseSlug, excludeOrgId = null) {
  let slug = baseSlug;
  let counter = 1;

  while (await orgRepository.slugExists(slug, excludeOrgId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Create a new organization with the creator as owner
 * @param {string} userId - User ID of the creator
 * @param {Object} data - Organization data
 * @param {string} data.name - Organization name
 * @param {string} [data.slug] - Organization slug (auto-generated if not provided)
 * @returns {Promise<Object>} Created organization with membership
 */
async function createOrganization(userId, { name, slug }) {
  // Generate slug if not provided
  let finalSlug = slug;
  if (!finalSlug) {
    finalSlug = generateSlug(name);
  }

  // Validate slug format
  const slugValidation = slugSchema.safeParse(finalSlug);
  if (!slugValidation.success) {
    throw new Error(`Invalid slug: ${slugValidation.error.errors[0].message}`);
  }

  // Ensure slug is unique
  finalSlug = await ensureUniqueSlug(finalSlug);

  // Create organization
  const organization = await orgRepository.create({
    name,
    slug: finalSlug,
  });

  // Add creator as OWNER
  const membership = await membershipRepository.create({
    userId,
    organizationId: organization.id,
    role: 'OWNER',
  });

  return {
    organization,
    membership,
  };
}

/**
 * Get organization by ID with permission check
 * @param {string} userId - User ID requesting access
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Organization
 * @throws {Error} If user doesn't have access
 */
async function getOrganization(userId, organizationId) {
  // Check if user is a member
  const membership = await membershipRepository.findByUserAndOrg(userId, organizationId);
  if (!membership) {
    throw new Error('Organization not found or access denied');
  }

  const organization = await orgRepository.findByIdWithMemberCount(organizationId);
  if (!organization) {
    throw new Error('Organization not found');
  }

  return {
    ...organization,
    role: membership.role,
  };
}

/**
 * Get all organizations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of organizations
 */
async function getUserOrganizations(userId) {
  return orgRepository.findByUserId(userId);
}

/**
 * Update organization
 * @param {string} userId - User ID making the request
 * @param {string} organizationId - Organization ID
 * @param {Object} data - Update data
 * @param {string} [data.name] - New name
 * @param {string} [data.slug] - New slug
 * @returns {Promise<Object>} Updated organization
 * @throws {Error} If user doesn't have permission
 */
async function updateOrganization(userId, organizationId, data) {
  // Check if user has OWNER or ADMIN role
  const hasPermission = await membershipRepository.hasRole(userId, organizationId, ['OWNER', 'ADMIN']);
  if (!hasPermission) {
    throw new Error('Insufficient permissions to update organization');
  }

  // If slug is being updated, ensure it's unique
  if (data.slug) {
    const slugValidation = slugSchema.safeParse(data.slug);
    if (!slugValidation.success) {
      throw new Error(`Invalid slug: ${slugValidation.error.errors[0].message}`);
    }

    data.slug = await ensureUniqueSlug(data.slug, organizationId);
  }

  return orgRepository.update(organizationId, data);
}

/**
 * Delete organization (owner only)
 * @param {string} userId - User ID making the request
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} Deleted organization
 * @throws {Error} If user is not owner
 */
async function deleteOrganization(userId, organizationId) {
  // Only OWNER can delete
  const hasPermission = await membershipRepository.hasRole(userId, organizationId, 'OWNER');
  if (!hasPermission) {
    throw new Error('Only organization owner can delete the organization');
  }

  return orgRepository.deleteById(organizationId);
}

/**
 * Get all members of an organization
 * @param {string} userId - User ID making the request
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of members
 * @throws {Error} If user doesn't have access
 */
async function getOrganizationMembers(userId, organizationId) {
  // Check if user is a member
  const membership = await membershipRepository.findByUserAndOrg(userId, organizationId);
  if (!membership) {
    throw new Error('Organization not found or access denied');
  }

  return membershipRepository.findByOrganizationId(organizationId);
}

/**
 * Invite a user to an organization (creates membership)
 * Note: This creates the membership directly. Email invitation flow would be added later.
 * @param {string} inviterId - User ID of the inviter
 * @param {string} organizationId - Organization ID
 * @param {string} inviteeUserId - User ID of the person being invited
 * @param {string} role - Role to assign
 * @returns {Promise<Object>} Created membership
 * @throws {Error} If inviter doesn't have permission or invitee is already a member
 */
async function inviteMember(inviterId, organizationId, inviteeUserId, role) {
  // Check if inviter has permission (OWNER or ADMIN can invite)
  const hasPermission = await membershipRepository.hasRole(inviterId, organizationId, ['OWNER', 'ADMIN']);
  if (!hasPermission) {
    throw new Error('Insufficient permissions to invite members');
  }

  // Check if invitee is already a member
  const existingMembership = await membershipRepository.findByUserAndOrg(inviteeUserId, organizationId);
  if (existingMembership) {
    throw new Error('User is already a member of this organization');
  }

  // Only OWNER can invite other OWNERs
  if (role === 'OWNER') {
    const isOwner = await membershipRepository.hasRole(inviterId, organizationId, 'OWNER');
    if (!isOwner) {
      throw new Error('Only organization owner can invite other owners');
    }
  }

  return membershipRepository.create({
    userId: inviteeUserId,
    organizationId,
    role,
  });
}

/**
 * Update member role
 * @param {string} requesterId - User ID making the request
 * @param {string} membershipId - Membership ID
 * @param {string} newRole - New role
 * @returns {Promise<Object>} Updated membership
 * @throws {Error} If requester doesn't have permission
 */
async function updateMemberRole(requesterId, membershipId, newRole) {
  const membership = await membershipRepository.findById(membershipId);
  if (!membership) {
    throw new Error('Membership not found');
  }

  const { organizationId, userId: targetUserId } = membership;

  // Cannot change your own role
  if (requesterId === targetUserId) {
    throw new Error('You cannot change your own role');
  }

  // Check if requester has permission (OWNER or ADMIN)
  const hasPermission = await membershipRepository.hasRole(requesterId, organizationId, ['OWNER', 'ADMIN']);
  if (!hasPermission) {
    throw new Error('Insufficient permissions to update member roles');
  }

  // Only OWNER can change OWNER roles or assign OWNER role
  if (membership.role === 'OWNER' || newRole === 'OWNER') {
    const isOwner = await membershipRepository.hasRole(requesterId, organizationId, 'OWNER');
    if (!isOwner) {
      throw new Error('Only organization owner can change owner roles');
    }
  }

  // Prevent removing the last owner
  if (membership.role === 'OWNER' && newRole !== 'OWNER') {
    const ownerCount = await membershipRepository.countByOrganizationAndRole(organizationId, 'OWNER');
    if (ownerCount <= 1) {
      throw new Error('Cannot remove the last owner. Assign another owner first.');
    }
  }

  return membershipRepository.updateRole(membershipId, newRole);
}

/**
 * Remove member from organization
 * @param {string} requesterId - User ID making the request
 * @param {string} membershipId - Membership ID
 * @returns {Promise<Object>} Deleted membership
 * @throws {Error} If requester doesn't have permission
 */
async function removeMember(requesterId, membershipId) {
  const membership = await membershipRepository.findById(membershipId);
  if (!membership) {
    throw new Error('Membership not found');
  }

  const { organizationId, userId: targetUserId, role } = membership;

  // Members can leave on their own, but OWNER and ADMIN can remove others
  const isSelf = requesterId === targetUserId;
  if (!isSelf) {
    const hasPermission = await membershipRepository.hasRole(requesterId, organizationId, ['OWNER', 'ADMIN']);
    if (!hasPermission) {
      throw new Error('Insufficient permissions to remove members');
    }

    // Only OWNER can remove OWNER
    if (role === 'OWNER') {
      const isOwner = await membershipRepository.hasRole(requesterId, organizationId, 'OWNER');
      if (!isOwner) {
        throw new Error('Only organization owner can remove other owners');
      }
    }
  }

  // Prevent removing the last owner
  if (role === 'OWNER') {
    const ownerCount = await membershipRepository.countByOrganizationAndRole(organizationId, 'OWNER');
    if (ownerCount <= 1) {
      throw new Error('Cannot remove the last owner. Assign another owner first.');
    }
  }

  return membershipRepository.deleteById(membershipId);
}

/**
 * Check if user has access to organization
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<boolean>} True if user has access
 */
async function hasAccess(userId, organizationId) {
  const membership = await membershipRepository.findByUserAndOrg(userId, organizationId);
  return !!membership;
}

/**
 * Check if user has specific role(s) in organization
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID
 * @param {string|string[]} roles - Role(s) to check
 * @returns {Promise<boolean>} True if user has one of the roles
 */
async function hasRole(userId, organizationId, roles) {
  return membershipRepository.hasRole(userId, organizationId, roles);
}

export {
  generateSlug,
  ensureUniqueSlug,
  createOrganization,
  getOrganization,
  getUserOrganizations,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  hasAccess,
  hasRole,
};
