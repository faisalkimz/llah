import { prisma } from '../../lib/prisma.js';

export async function createOrUpdate(organizationId, data) {
  return prisma.usageAggregate.upsert({
    where: {
      organizationId_customerId_meterId_periodStart_periodEnd: {
        organizationId,
        customerId: data.customerId,
        meterId: data.meterId,
        periodStart: new Date(data.periodStart),
        periodEnd: new Date(data.periodEnd),
      },
    },
    create: {
      organizationId,
      ...data,
      periodStart: new Date(data.periodStart),
      periodEnd: new Date(data.periodEnd),
    },
    update: {
      quantity: data.quantity,
    },
  });
}

export async function findMany(organizationId, options = {}) {
  const {customerId, meterId, periodStart, periodEnd, limit = 20, offset = 0} = options;
  const where = {organizationId};

  if (customerId) where.customerId = customerId;
  if (meterId) where.meterId = meterId;
  if (periodStart) where.periodStart = {gte: new Date(periodStart)};
  if (periodEnd) where.periodEnd = {lte: new Date(periodEnd)};

  return prisma.usageAggregate.findMany({
    where,
    orderBy: {periodStart: 'desc'},
    take: limit,
    skip: offset,
  });
}

export async function count(organizationId, options = {}) {
  const {customerId, meterId, periodStart, periodEnd} = options;
  const where = {organizationId};

  if (customerId) where.customerId = customerId;
  if (meterId) where.meterId = meterId;
  if (periodStart) where.periodStart = {gte: new Date(periodStart)};
  if (periodEnd) where.periodEnd = {lte: new Date(periodEnd)};

  return prisma.usageAggregate.count({where});
}
