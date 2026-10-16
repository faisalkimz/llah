import prisma from '../../lib/prisma.js';

export async function getDeveloperOverview(orgId) {
  const [apiKeyCount, totalUsageEvents, recentEvents] = await Promise.all([
    prisma.apiKey.count({
      where: { organizationId: orgId, status: 'ACTIVE' },
    }),
    prisma.usageEvent.count({
      where: { organizationId: orgId },
    }),
    prisma.auditEvent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    apiKeyCount,
    totalUsageEvents,
    recentEvents,
    testMode: false,
  };
}

export async function getApiStats(orgId, { from, to }) {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  const [usageEventCount, activeApiKeyCount] = await Promise.all([
    prisma.usageEvent.count({
      where: {
        organizationId: orgId,
        receivedAt: { gte: fromDate, lte: toDate },
      },
    }),
    prisma.apiKey.count({
      where: {
        organizationId: orgId,
        lastUsedAt: { gte: fromDate, lte: toDate },
      },
    }),
  ]);

  return { usageEventCount, activeApiKeyCount };
}

export async function getWebhookStats(orgId) {
  const groups = await prisma.webhookDelivery.groupBy({
    by: ['status'],
    where: {
      endpoint: { organizationId: orgId },
    },
    _count: { id: true },
  });

  const stats = groups.reduce(
    (acc, g) => {
      acc.total += g._count.id;
      const key = g.status.toLowerCase();
      if (key === 'succeeded') acc.succeeded += g._count.id;
      else if (key === 'failed') acc.failed += g._count.id;
      else if (key === 'pending') acc.pending += g._count.id;
      return acc;
    },
    { total: 0, succeeded: 0, failed: 0, pending: 0 }
  );

  return stats;
}
