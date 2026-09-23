import prisma from '../../lib/prisma.js';

export async function createSubscription(data) {
  return await prisma.subscription.create({
    data,
    include: {
      customer: true,
      plan: {
        include: {
          items: {
            include: {
              price: true
            }
          }
        }
      }
    }
  });
}

export async function findSubscriptionsByOrganization(organizationId, filters = {}) {
  const { customerId, status, limit = 20, offset = 0 } = filters;
  const where = { organizationId };
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  return await prisma.subscription.findMany({
    where,
    include: {
      customer: true,
      plan: {
        include: {
          items: {
            include: {
              price: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

export async function findSubscriptionById(subscriptionId, organizationId) {
  return await prisma.subscription.findFirst({
    where: { id: subscriptionId, organizationId },
    include: {
      customer: true,
      plan: {
        include: {
          items: {
            include: {
              price: true
            }
          }
        }
      }
    }
  });
}

export async function updateSubscription(subscriptionId, organizationId, data) {
  return await prisma.subscription.update({
    where: { id: subscriptionId, organizationId },
    data,
    include: {
      customer: true,
      plan: {
        include: {
          items: {
            include: {
              price: true
            }
          }
        }
      }
    }
  });
}

export async function deleteSubscription(subscriptionId, organizationId) {
  return await prisma.subscription.delete({
    where: { id: subscriptionId, organizationId }
  });
}
