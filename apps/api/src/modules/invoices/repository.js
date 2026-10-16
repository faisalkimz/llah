import prisma from '../../lib/prisma.js';

/**
 * createInvoice — creates an invoice with line items.
 *
 * IMPORTANT: subtotalMinor and totalMinor must be computed by the caller
 * (service layer) using integer arithmetic only. This repository stores
 * what it is given; it does NOT recalculate totals.
 *
 * Each line item must supply `amountMinor` (BigInt or number) pre-computed
 * as floor(quantity) * unitAmountMinor.
 */
export async function createInvoice(data) {
  const { lines, subtotalMinor, totalMinor, ...invoiceData } = data;

  return await prisma.invoice.create({
    data: {
      ...invoiceData,
      subtotalMinor: BigInt(subtotalMinor ?? 0),
      totalMinor: BigInt(totalMinor ?? subtotalMinor ?? 0),
      lines: {
        create: lines.map((line) => ({
          description: line.description,
          quantity: line.quantity,
          unitAmountMinor: BigInt(line.unitAmountMinor),
          amountMinor: BigInt(line.amountMinor)
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

/**
 * Find the maximum invoice sequence number for an org to support sequencing.
 * Returns the raw `number` string of the most recently created invoice, or null.
 */
export async function findLastInvoiceNumber(organizationId) {
  const invoice = await prisma.invoice.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    select: { number: true }
  });
  return invoice?.number ?? null;
}

/**
 * Add a credit line to an existing invoice and update its totalMinor.
 * When a Prisma transaction client (tx) is provided, runs within that
 * transaction; otherwise opens its own transaction.
 */
export async function addCreditLine(invoiceId, organizationId, { description, amountToApplyMinor }, tx) {
  const client = tx ?? prisma;

  const run = async (client) => {
    const invoice = await client.invoice.findFirst({
      where: { id: invoiceId, organizationId }
    });
    if (!invoice) {
      const err = new Error('Invoice not found');
      err.status = 404;
      throw err;
    }

    // Create credit line (negative amount)
    await client.invoiceLine.create({
      data: {
        invoiceId,
        description,
        quantity: 1,
        unitAmountMinor: -BigInt(amountToApplyMinor),
        amountMinor: -BigInt(amountToApplyMinor)
      }
    });

    // Update invoice totalMinor
    const newTotal = BigInt(invoice.totalMinor) - BigInt(amountToApplyMinor);
    return await client.invoice.update({
      where: { id: invoiceId },
      data: { totalMinor: newTotal },
      include: { customer: true, lines: true, payments: true }
    });
  };

  // If a tx was passed in, run directly (already inside a transaction)
  if (tx) {
    return await run(tx);
  }

  // Otherwise open our own transaction
  return await prisma.$transaction(async (innerTx) => run(innerTx));
}
