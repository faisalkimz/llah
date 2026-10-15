import prisma from '../../lib/prisma.js';

export async function createCreditGrant(data) {
  return await prisma.creditGrant.create({
    data: {
      ...data,
      remainingMinor: BigInt(data.amountMinor)
    }
  });
}

export async function findCreditGrantsByOrganization(organizationId, filters = {}) {
  const { customerId, limit = 20, offset = 0 } = filters;
  const where = { organizationId };
  if (customerId) where.customerId = customerId;

  return await prisma.creditGrant.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

export async function findCreditGrantById(grantId, organizationId) {
  return await prisma.creditGrant.findFirst({
    where: { id: grantId, organizationId }
  });
}

/**
 * Return credit grants where remainingMinor > 0 and not yet expired.
 */
export async function findActiveCredits(organizationId, customerId) {
  const now = new Date();
  return await prisma.creditGrant.findMany({
    where: {
      organizationId,
      customerId,
      remainingMinor: { gt: 0 },
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    },
    orderBy: { createdAt: 'asc' }
  });
}

/**
 * Decrement remainingMinor by amountToApplyMinor (integer arithmetic only).
 */
export async function decrementCreditGrant(grantId, amountToApplyMinor) {
  return await prisma.creditGrant.update({
    where: { id: grantId },
    data: {
      remainingMinor: {
        decrement: BigInt(amountToApplyMinor)
      }
    }
  });
}
