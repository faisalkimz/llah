import { prisma } from '../../lib/prisma.js';

/**
 * Organization data access layer
 */

/**
 * Create a new organization
 * @param {Object} data - Organization data
 * @param {string} data.name - Organization name
 * @param {string} data.slug - Organization slug (must be unique)
 * @returns {Promise<Object>} Created organization
 */
async function create({ name, slug }) {
  return prisma.organization.create({
    data: {
      name,
      slug,
    },
  });
}

/**
 * Find organization by ID
 * @param {string} id - Organization ID
 * @returns {Promise<Object|null>} Organization or null if not found
 */
async function findById(id) {
  return prisma.organization.findUnique({
    where: { id },
  });
}

/**
 * Find organization by slug
 * @param {string} slug - Organization slug
 * @returns {Promise<Object|null>} Organization or null if not found
 */
async function findBySlug(slug) {
  return prisma.organization.findUnique({
    where: { slug },
  });
}

/**
 * Get all organizations for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of organizations with membership info
 */
async function findByUserId(userId) {
  const memberships = await prisma.membership.findMany({
    where: { userId },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return memberships.map((m) => ({
    ...m.organization,
    role: m.role,
    membershipId: m.id,
  }));
}

/**
 * Update organization
 * @param {string} id - Organization ID
 * @param {Object} data - Update data
 * @param {string} [data.name] - New name
 * @param {string} [data.slug] - New slug
 * @returns {Promise<Object>} Updated organization
 */
async function update(id, data) {
  return prisma.organization.update({
    where: { id },
    data,
  });
}

/**
 * Delete organization
 * @param {string} id - Organization ID
 * @returns {Promise<Object>} Deleted organization
 */
async function deleteById(id) {
  return prisma.organization.delete({
    where: { id },
  });
}

/**
 * Check if slug exists (for uniqueness validation)
 * @param {string} slug - Slug to check
 * @param {string} [excludeOrgId] - Organization ID to exclude (for updates)
 * @returns {Promise<boolean>} True if slug exists
 */
async function slugExists(slug, excludeOrgId = null) {
  const where = { slug };
  if (excludeOrgId) {
    where.id = { not: excludeOrgId };
  }

  const count = await prisma.organization.count({ where });
  return count > 0;
}

/**
 * Get organization with member count
 * @param {string} id - Organization ID
 * @returns {Promise<Object|null>} Organization with member count
 */
async function findByIdWithMemberCount(id) {
  const org = await prisma.organization.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          memberships: true,
        },
      },
    },
  });

  if (!org) return null;

  return {
    ...org,
    memberCount: org._count.memberships,
    _count: undefined,
  };
}

export {
  create,
  findById,
  findBySlug,
  findByUserId,
  update,
  deleteById,
  slugExists,
  findByIdWithMemberCount,
};
