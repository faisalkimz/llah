import prisma from '../../lib/prisma.js';

// Adjustments will be stored as ledger entries with type=ADJUSTMENT
export async function createAdjustment(data) {
  const ledgerType = data.type === 'CREDIT' ? 'CREDIT' : 'ADJUSTMENT';
  
  return await prisma.ledgerEntry.create({
    data: {
      organizationId: data.organizationId,
      customerId: data.customerId,
      type: ledgerType,
      currency: data.currency,
      amountMinor: BigInt(data.amountMinor),
      referenceType: data.referenceType,
      referenceId: data.referenceId,
      description: data.reason
    },
    include: {
      customer: true
    }
  });
}

export async function findAdjustmentsByOrganization(organizationId, filters = {}) {
  const { customerId, type, limit = 20, offset = 0 } = filters;
  const where = { 
    organizationId,
    type: { in: ['ADJUSTMENT', 'CREDIT'] }
  };
  if (customerId) where.customerId = customerId;

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

export async function findAdjustmentById(adjustmentId, organizationId) {
  return await prisma.ledgerEntry.findFirst({
    where: { 
      id: adjustmentId, 
      organizationId,
      type: { in: ['ADJUSTMENT', 'CREDIT'] }
    },
    include: {
      customer: true
    }
  });
}
