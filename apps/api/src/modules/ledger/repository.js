import prisma from '../../lib/prisma.js';

export async function createLedgerEntry(data) {
  return await prisma.ledgerEntry.create({
    data,
    include: {
      customer: true
    }
  });
}

export async function findLedgerEntriesByOrganization(organizationId, filters = {}) {
  const { customerId, type, limit = 20, offset = 0 } = filters;
  const where = { organizationId };
  if (customerId) where.customerId = customerId;
  if (type) where.type = type;

  return await prisma.ledgerEntry.findMany({
    where,
    include: {
      customer: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

export async function findLedgerEntryById(entryId, organizationId) {
  return await prisma.ledgerEntry.findFirst({
    where: { id: entryId, organizationId },
    include: {
      customer: true
    }
  });
}
