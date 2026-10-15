import prisma from '../../lib/prisma.js';
import * as repository from './repository.js';

export async function aggregateUsage(organizationId, params) {
  const { customerId, meterId, periodStart, periodEnd } = params;

  // Fetch meter to determine aggregation type
  const meter = await prisma.meter.findFirst({
    where: { id: meterId, organizationId },
  });

  if (!meter) {
    const err = new Error('Meter not found');
    err.status = 404;
    throw err;
  }

  const aggregation = (meter.aggregation || 'SUM').toUpperCase();
  const dateFrom = new Date(periodStart);
  const dateTo = new Date(periodEnd);
  const where = { organizationId, customerId, meterId, eventAt: { gte: dateFrom, lte: dateTo } };

  let quantity;

  if (aggregation === 'SUM') {
    const agg = await prisma.usageEvent.aggregate({
      where,
      _sum: { quantity: true },
    });
    quantity = Number(agg._sum.quantity ?? 0);
  } else if (aggregation === 'COUNT') {
    quantity = await prisma.usageEvent.count({ where });
  } else if (aggregation === 'MAX') {
    const agg = await prisma.usageEvent.aggregate({
      where,
      _max: { quantity: true },
    });
    quantity = Number(agg._max.quantity ?? 0);
  } else if (aggregation === 'LATEST') {
    const latest = await prisma.usageEvent.findFirst({
      where,
      orderBy: { eventAt: 'desc' },
      select: { quantity: true },
    });
    quantity = latest ? Number(latest.quantity) : 0;
  } else {
    // Fallback to SUM for unknown aggregation types
    const agg = await prisma.usageEvent.aggregate({
      where,
      _sum: { quantity: true },
    });
    quantity = Number(agg._sum.quantity ?? 0);
  }

  return repository.createOrUpdate(organizationId, {
    customerId,
    meterId,
    periodStart,
    periodEnd,
    quantity,
  });
}

export async function listAggregates(organizationId, filters = {}) {
  const [aggregates, total] = await Promise.all([
    repository.findMany(organizationId, filters),
    repository.count(organizationId, filters),
  ]);

  return {
    aggregates,
    pagination: {
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    },
  };
}
