import prisma from '../../lib/prisma.js';

export async function createPayment(data) {
  return await prisma.payment.create({
    data,
    include: {
      invoice: {
        include: {
          customer: true
        }
      }
    }
  });
}

export async function findPaymentsByOrganization(organizationId, filters = {}) {
  const { invoiceId, status, limit = 20, offset = 0 } = filters;
  const where = { organizationId };
  if (invoiceId) where.invoiceId = invoiceId;
  if (status) where.status = status;

  return await prisma.payment.findMany({
    where,
    include: {
      invoice: {
        include: {
          customer: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

export async function findPaymentById(paymentId, organizationId) {
  return await prisma.payment.findFirst({
    where: { id: paymentId, organizationId },
    include: {
      invoice: {
        include: {
          customer: true
        }
      },
      refunds: true
    }
  });
}

export async function updatePayment(paymentId, organizationId, data) {
  return await prisma.payment.update({
    where: { id: paymentId, organizationId },
    data,
    include: {
      invoice: true
    }
  });
}
