import prisma from '../../lib/prisma.js';

export async function findBillingPeriodsByOrganization(organizationId, filters = {}) {
  const { customerId, subscriptionId, limit = 20, offset = 0 } = filters;
  const where = { organizationId };
  if (customerId) where.customerId = customerId;
  if (subscriptionId) where.subscriptionId = subscriptionId;

  // Billing periods are derived from subscriptions
  return await prisma.subscription.findMany({
    where,
    select: {
      id: true,
      customerId: true,
      planId: true,
      currentPeriodStart: true,
      currentPeriodEnd: true,
      status: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      plan: {
        select: {
          id: true,
          name: true
        }
      }
    },
    orderBy: { currentPeriodStart: 'desc' },
    take: limit,
    skip: offset
  });
}
