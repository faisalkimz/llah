import prisma from '../../lib/prisma.js';

export async function createCreditGrant(data) {
  return await prisma.creditGrant.create({
    data: {
      ...data,
      remainingMinor: data.amountMinor
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
