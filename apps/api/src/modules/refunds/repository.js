import prisma from '../../lib/prisma.js';

export async function createRefund(data) {
  return await prisma.refund.create({
    data,
    include: {
      payment: {
        include: {
          invoice: {
            include: {
              customer: true
            }
          }
        }
      }
    }
  });
}

export async function findRefundsByOrganization(organizationId, filters = {}) {
  const { paymentId, limit = 20, offset = 0 } = filters;
  const where = {
    payment: {
      organizationId
    }
  };
  if (paymentId) where.paymentId = paymentId;

  return await prisma.refund.findMany({
    where,
    include: {
      payment: {
        include: {
          invoice: {
            include: {
              customer: true
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

export async function findRefundById(refundId, organizationId) {
  return await prisma.refund.findFirst({
    where: { 
      id: refundId,
      payment: {
        organizationId
      }
    },
    include: {
      payment: {
        include: {
          invoice: {
            include: {
              customer: true
            }
          }
        }
      }
    }
  });
}
