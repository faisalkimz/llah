import { prisma } from '../../lib/prisma.js';

/**
 * Membership data access layer
 */

/**
 * Create a new membership
 * @param {Object} data - Membership data
 * @param {string} data.userId - User ID
 * @param {string} data.organizationId - Organization ID
 * @param {string} data.role - Membership role
 * @returns {Promise<Object>} Created membership
 */
async function create({ userId, organizationId, role }) {
  return prisma.membership.create({
    data: {
      userId,
      organizationId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Find membership by ID
 * @param {string} id - Membership ID
 * @returns {Promise<Object|null>} Membership or null if not found
 */
async function findById(id) {
  return prisma.membership.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
}

/**
 * Find membership by user and organization
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object|null>} Membership or null if not found
 */
async function findByUserAndOrg(userId, organizationId) {
  return prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Get all members of an organization
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Array>} Array of memberships with user info
 */
async function findByOrganizationId(organizationId) {
  return prisma.membership.findMany({
    where: { organizationId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      },
    },
    orderBy: [
      { role: 'asc' }, // OWNER first, then ADMIN, etc.
      { createdAt: 'asc' },
    ],
  });
}

/**
 * Update membership role
 * @param {string} id - Membership ID
 * @param {string} role - New role
 * @returns {Promise<Object>} Updated membership
 */
async function updateRole(id, role) {
  return prisma.membership.update({
    where: { id },
    data: { role },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
  });
}

/**
 * Delete membership
 * @param {string} id - Membership ID
 * @returns {Promise<Object>} Deleted membership
 */
async function deleteById(id) {
  return prisma.membership.delete({
    where: { id },
  });
}

/**
 * Count memberships by organization and role
 * @param {string} organizationId - Organization ID
 * @param {string} role - Role to count
 * @returns {Promise<number>} Count of memberships with that role
 */
async function countByOrganizationAndRole(organizationId, role) {
  return prisma.membership.count({
    where: {
      organizationId,
      role,
    },
  });
}

/**
 * Check if user has specific role in organization
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID
 * @param {string|string[]} roles - Role(s) to check (string or array)
 * @returns {Promise<boolean>} True if user has one of the roles
 */
async function hasRole(userId, organizationId, roles) {
  const roleArray = Array.isArray(roles) ? roles : [roles];

  const count = await prisma.membership.count({
    where: {
      userId,
      organizationId,
      role: {
        in: roleArray,
      },
    },
  });

  return count > 0;
}

/**
 * Get user's role in organization
 * @param {string} userId - User ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<string|null>} Role or null if not a member
 */
async function getUserRole(userId, organizationId) {
  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId,
        organizationId,
      },
    },
    select: {
      role: true,
    },
  });

  return membership?.role || null;
}

export {
  create,
  findById,
  findByUserAndOrg,
  findByOrganizationId,
  updateRole,
  deleteById,
  countByOrganizationAndRole,
  hasRole,
  getUserRole,
};
