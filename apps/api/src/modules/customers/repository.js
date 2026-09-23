import { prisma } from '../../lib/prisma.js';

/**
 * Customer repository - all data access for customers
 * All queries are scoped to organizationId for multi-tenancy
 */

/**
 * Create a new customer
 */
export async function create(organizationId, data) {
  return prisma.customer.create({
    data: {
      organizationId,
      ...data,
    },
  });
}

/**
 * Find customer by ID (with org scoping)
 */
export async function findById(customerId, organizationId) {
  return prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
    },
  });
}

/**
 * Find customer by external ID (with org scoping)
 */
export async function findByExternalId(externalId, organizationId) {
  return prisma.customer.findUnique({
    where: {
      organizationId_externalId: {
        organizationId,
        externalId,
      },
    },
  });
}

/**
 * Find customer by email (with org scoping)
 */
export async function findByEmail(email, organizationId) {
  return prisma.customer.findFirst({
    where: {
      email,
      organizationId,
    },
  });
}

/**
 * List customers with pagination and search
 */
export async function findMany(organizationId, options = {}) {
  const {
    search,
    email,
    limit = 20,
    offset = 0,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = options;

  const where = {
    organizationId,
    ...(search && {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ],
    }),
    ...(email && { email: { contains: email, mode: 'insensitive' } }),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    customers,
    total,
    limit,
    offset,
  };
}

/**
 * Update customer by ID (with org scoping)
 */
export async function update(customerId, organizationId, data) {
  return prisma.customer.update({
    where: {
      id: customerId,
      organizationId,
    },
    data,
  });
}

/**
 * Delete customer by ID (with org scoping)
 */
export async function deleteById(customerId, organizationId) {
  return prisma.customer.delete({
    where: {
      id: customerId,
      organizationId,
    },
  });
}

/**
 * Count customers in organization
 */
export async function count(organizationId) {
  return prisma.customer.count({
    where: { organizationId },
  });
}

/**
 * Check if customer exists by ID (with org scoping)
 */
export async function exists(customerId, organizationId) {
  const count = await prisma.customer.count({
    where: {
      id: customerId,
      organizationId,
    },
  });
  return count > 0;
}

/**
 * Check if external ID is already used in organization
 */
export async function externalIdExists(externalId, organizationId, excludeCustomerId = null) {
  const where = {
    externalId,
    organizationId,
    ...(excludeCustomerId && { id: { not: excludeCustomerId } }),
  };
  
  const count = await prisma.customer.count({ where });
  return count > 0;
}

/**
 * Get customer with related data (subscriptions, invoices count)
 */
export async function findByIdWithStats(customerId, organizationId) {
  return prisma.customer.findFirst({
    where: {
      id: customerId,
      organizationId,
    },
    include: {
      _count: {
        select: {
          subscriptions: true,
          invoices: true,
          usageEvents: true,
        },
      },
    },
  });
}
