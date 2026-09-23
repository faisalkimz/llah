import { prisma } from '../../lib/prisma.js';

/**
 * Meter repository - handles all database operations for meters
 * All operations are org-scoped
 */

/**
 * Create a new meter
 * @param {string} organizationId - Organization ID
 * @param {object} data - Meter data (key, name, unit, aggregation)
 * @returns {Promise<object>} Created meter
 */
export async function create(organizationId, data) {
  return prisma.meter.create({
    data: {
      organizationId,
      ...data,
    },
  });
}

/**
 * Find a meter by ID within an organization
 * @param {string} meterId - Meter ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object|null>} Meter or null if not found
 */
export async function findById(meterId, organizationId) {
  return prisma.meter.findFirst({
    where: {
      id: meterId,
      organizationId,
    },
  });
}

/**
 * Find a meter by key within an organization
 * @param {string} key - Meter key
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object|null>} Meter or null if not found
 */
export async function findByKey(key, organizationId) {
  return prisma.meter.findUnique({
    where: {
      organizationId_key: {
        organizationId,
        key,
      },
    },
  });
}

/**
 * Find meters with optional filters and pagination
 * @param {string} organizationId - Organization ID
 * @param {object} options - Query options
 * @param {string} options.search - Search term for name or key
 * @param {number} options.limit - Results per page
 * @param {number} options.offset - Pagination offset
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort order (asc/desc)
 * @returns {Promise<Array>} Array of meters
 */
export async function findMany(organizationId, options = {}) {
  const {
    search,
    limit = 20,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const where = {
    organizationId,
  };

  // Add search filter if provided
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { key: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.meter.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    take: limit,
    skip: offset,
  });
}

/**
 * Count meters with optional filters
 * @param {string} organizationId - Organization ID
 * @param {object} options - Query options
 * @param {string} options.search - Search term
 * @returns {Promise<number>} Total count
 */
export async function count(organizationId, options = {}) {
  const { search } = options;

  const where = {
    organizationId,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { key: { contains: search, mode: 'insensitive' } },
    ];
  }

  return prisma.meter.count({ where });
}

/**
 * Update a meter
 * @param {string} meterId - Meter ID
 * @param {string} organizationId - Organization ID
 * @param {object} data - Fields to update
 * @returns {Promise<object>} Updated meter
 */
export async function update(meterId, organizationId, data) {
  return prisma.meter.update({
    where: {
      id: meterId,
      organizationId,
    },
    data,
  });
}

/**
 * Delete a meter
 * @param {string} meterId - Meter ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object>} Deleted meter
 */
export async function deleteById(meterId, organizationId) {
  return prisma.meter.delete({
    where: {
      id: meterId,
      organizationId,
    },
  });
}

/**
 * Check if a meter has any usage events
 * @param {string} meterId - Meter ID
 * @returns {Promise<boolean>} True if meter has usage
 */
export async function hasUsage(meterId) {
  const count = await prisma.usageEvent.count({
    where: { meterId },
    take: 1,
  });
  return count > 0;
}

/**
 * Check if a meter is used in any prices
 * @param {string} meterId - Meter ID
 * @returns {Promise<boolean>} True if meter is used in prices
 */
export async function hasPrice(meterId) {
  const count = await prisma.price.count({
    where: { meterId },
    take: 1,
  });
  return count > 0;
}

/**
 * Get meter with usage and price counts
 * @param {string} meterId - Meter ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object|null>} Meter with _count for relationships
 */
export async function findByIdWithStats(meterId, organizationId) {
  return prisma.meter.findFirst({
    where: {
      id: meterId,
      organizationId,
    },
    include: {
      _count: {
        select: {
          usageEvents: true,
          prices: true,
        },
      },
    },
  });
}
