import { prisma } from '../../lib/prisma.js';

/**
 * Usage event repository - idempotent event ingestion
 */

export async function create(organizationId, data) {
  return prisma.usageEvent.create({
    data: {
      organizationId,
      ...data,
      eventAt: new Date(data.eventAt),
    },
  });
}

export async function findByIdempotencyKey(organizationId, idempotencyKey) {
  return prisma.usageEvent.findUnique({
    where: {
      organizationId_idempotencyKey: {
        organizationId,
        idempotencyKey,
      },
    },
  });
}

export async function findById(eventId, organizationId) {
  return prisma.usageEvent.findFirst({
    where: {
      id: eventId,
      organizationId,
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      meter: { select: { id: true, key: true, name: true, unit: true } },
    },
  });
}

export async function findMany(organizationId, options = {}) {
  const {
    customerId,
    meterId,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = options;

  const where = { organizationId };

  if (customerId) where.customerId = customerId;
  if (meterId) where.meterId = meterId;
  if (startDate || endDate) {
    where.eventAt = {};
    if (startDate) where.eventAt.gte = new Date(startDate);
    if (endDate) where.eventAt.lte = new Date(endDate);
  }

  return prisma.usageEvent.findMany({
    where,
    include: {
      customer: { select: { id: true, name: true } },
      meter: { select: { id: true, key: true, name: true, unit: true } },
    },
    orderBy: { eventAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function count(organizationId, options = {}) {
  const { customerId, meterId, startDate, endDate } = options;
  const where = { organizationId };

  if (customerId) where.customerId = customerId;
  if (meterId) where.meterId = meterId;
  if (startDate || endDate) {
    where.eventAt = {};
    if (startDate) where.eventAt.gte = new Date(startDate);
    if (endDate) where.eventAt.lte = new Date(endDate);
  }

  return prisma.usageEvent.count({ where });
}
