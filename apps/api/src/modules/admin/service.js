import prisma from '../../lib/prisma.js';

/**
 * Get aggregate system-wide statistics.
 */
export async function getSystemStats() {
  const [
    orgCount,
    userCount,
    customerCount,
    subscriptionCount,
    invoiceCount,
    paymentCount,
  ] = await prisma.$transaction([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.customer.count(),
    prisma.subscription.count(),
    prisma.invoice.count(),
    prisma.payment.count(),
  ]);

  return { orgCount, userCount, customerCount, subscriptionCount, invoiceCount, paymentCount };
}

/**
 * List all organizations across the platform.
 * @param {{ limit?: number, offset?: number }} opts
 */
export async function listAllOrgs({ limit = 20, offset = 0 } = {}) {
  return prisma.organization.findMany({
    take: limit,
    skip: offset,
    include: {
      _count: {
        select: { memberships: true, customers: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * List all users across the platform.
 * @param {{ limit?: number, offset?: number }} opts
 */
export async function listAllUsers({ limit = 20, offset = 0 } = {}) {
  return prisma.user.findMany({
    take: limit,
    skip: offset,
    include: {
      _count: {
        select: { memberships: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get a detailed overview of a single organization.
 * @param {string} orgId
 */
export async function getOrgOverview(orgId) {
  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      _count: {
        select: {
          memberships: true,
          customers: true,
          subscriptions: true,
          invoices: true,
        },
      },
    },
  });

  if (!org) {
    const err = new Error('Organization not found.');
    err.status = 404;
    throw err;
  }

  const revenueAgg = await prisma.invoice.aggregate({
    where: { organizationId: orgId, status: 'PAID' },
    _sum: { totalMinor: true },
  });

  const revenueMinor = revenueAgg._sum.totalMinor?.toString() ?? '0';

  return { ...org, revenueMinor };
}

/**
 * Check platform-wide system health.
 */
export async function getSystemHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    const [activeSubscriptionCount, runningJobCount, failedWebhookDeliveryCount] =
      await Promise.all([
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.jobRun.count({ where: { status: 'RUNNING' } }),
        prisma.webhookDelivery.count({ where: { status: 'FAILED' } }),
      ]);

    return {
      database: 'connected',
      activeSubscriptionCount,
      runningJobCount,
      failedWebhookDeliveryCount,
      timestamp: new Date().toISOString(),
    };
  } catch (e) {
    return {
      database: 'disconnected',
      error: e.message,
      timestamp: new Date().toISOString(),
    };
  }
}
