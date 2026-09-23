import prisma from '../../lib/prisma.js';

export async function createInvoice(data) {
  const { lines, ...invoiceData } = data;
  
  const lineAmounts = lines.map(line => {
    const quantity = Number(line.quantity);
    return BigInt(line.unitAmountMinor) * BigInt(Math.floor(quantity * 100)) / BigInt(100);
  });
  
  const subtotal = lineAmounts.reduce((sum, amt) => sum + amt, BigInt(0));
  
  return await prisma.invoice.create({
    data: {
      ...invoiceData,
      subtotalMinor: subtotal,
      totalMinor: subtotal,
      lines: {
        create: lines.map(line => ({
          description: line.description,
          quantity: line.quantity,
          unitAmountMinor: BigInt(line.unitAmountMinor),
          amountMinor: BigInt(line.unitAmountMinor) * BigInt(Math.floor(Number(line.quantity) * 100)) / BigInt(100),
          metadata: line.metadata
        }))
      }
    },
    include: {
      customer: true,
      lines: true
    }
  });
}

export async function findInvoicesByOrganization(organizationId, filters = {}) {
  const { customerId, status, limit = 20, offset = 0 } = filters;
  const where = { organizationId };
  if (customerId) where.customerId = customerId;
  if (status) where.status = status;

  return await prisma.invoice.findMany({
    where,
    include: {
      customer: true,
      lines: true
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  });
}

export async function findInvoiceById(invoiceId, organizationId) {
  return await prisma.invoice.findFirst({
    where: { id: invoiceId, organizationId },
    include: {
      customer: true,
      lines: true,
      payments: true
    }
  });
}

export async function updateInvoice(invoiceId, organizationId, data) {
  return await prisma.invoice.update({
    where: { id: invoiceId, organizationId },
    data,
    include: {
      customer: true,
      lines: true
    }
  });
}
