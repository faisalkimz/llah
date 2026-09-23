import { prisma } from '../../lib/prisma.js';
import * as repository from './repository.js';

export async function aggregateUsage(organizationId, params) {
  const {customerId, meterId, periodStart, periodEnd} = params;

  // Query raw usage events for the period
  const events = await prisma.usageEvent.findMany({
    where: {
      organizationId,
      customerId,
      meterId,
      eventAt: {
        gte: new Date(periodStart),
        lte: new Date(periodEnd),
      },
    },
  });

  // Aggregate quantity (SUM for now - extend for COUNT/MAX/LATEST later)
  const quantity = events.reduce((sum, e) => sum + parseFloat(e.quantity.toString()), 0);

  // Store aggregate
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
