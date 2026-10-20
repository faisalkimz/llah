import prisma from '../../lib/prisma.js';

// Capture server start time once at module load
const SERVER_START = new Date();

/**
 * Public health check — database connectivity only.
 */
export async function healthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    return {
      status: 'degraded',
      database: 'disconnected',
      error: e.message,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Org-scoped metrics.
 * @param {string} orgId
 */
export async function getMetrics(orgId) {
  // Count API keys for the org
  const apiKeyCount = await prisma.apiKey.count({
    where: { organizationId: orgId },
  });

  // Find all webhook endpoint ids for the org
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { organizationId: orgId },
    select: { id: true },
  });
  const endpointIds = endpoints.map((e) => e.id);

  // Count webhook deliveries grouped by status
  const deliveryGroups = await prisma.webhookDelivery.groupBy({
    by: ['status'],
    where: { endpointId: { in: endpointIds } },
    _count: true,
  });
  const webhookDeliveryByStatus = deliveryGroups.reduce((acc, g) => {
    acc[g.status] = g._count;
    return acc;
  }, {});

  // Count audit events in the last 24 hours
  const auditEventsLast24h = await prisma.auditEvent.count({
    where: {
      organizationId: orgId,
      createdAt: { gte: new Date(Date.now() - 86400000) },
    },
  });

  return { apiKeyCount, webhookDeliveryByStatus, auditEventsLast24h };
}

/**
 * Process uptime and memory stats (no DB call needed).
 */
export function getUptime() {
  return {
    startedAt: SERVER_START.toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  };
}
