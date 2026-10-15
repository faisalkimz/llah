import prisma from '../../lib/prisma.js';
import * as repo from './repository.js';
import * as ledgerRepo from '../ledger/repository.js';

/**
 * createAdjustment
 *
 * Creates an adjustment record (stored as a LedgerEntry) and optionally
 * attaches an InvoiceLine to the referenced invoice.
 *
 * @param {string} orgId
 * @param {{ customerId, invoiceId?, amountMinor, type, reason, currency?, referenceType?, referenceId? }} params
 */
export async function createAdjustment(orgId, {
  customerId,
  invoiceId,
  amountMinor,
  type,
  reason,
  currency = 'USD',
  referenceType,
  referenceId,
}) {
  // amountMinor != 0 is enforced by Zod, but double-guard here
  if (amountMinor === 0) {
    const err = new Error('amountMinor must not be zero');
    err.status = 422;
    throw err;
  }

  // Map adjustment type → LedgerEntry type
  // CREDIT → CREDIT, DEBIT → ADJUSTMENT
  const ledgerType = type === 'CREDIT' ? 'CREDIT' : 'ADJUSTMENT';

  // Use a transaction so the ledger entry + optional invoice line are atomic
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create LedgerEntry (the canonical adjustment record)
    const ledgerEntry = await tx.ledgerEntry.create({
      data: {
        organizationId: orgId,
        customerId,
        type: ledgerType,
        currency,
        amountMinor: BigInt(Math.abs(amountMinor)),
        referenceType: referenceType ?? (invoiceId ? 'Invoice' : null),
        referenceId: referenceId ?? invoiceId ?? null,
        description: reason,
      },
    });

    // 2. If invoiceId was provided, add an InvoiceLine and adjust totalMinor
    if (invoiceId) {
      const invoice = await tx.invoice.findFirst({
        where: { id: invoiceId, organizationId: orgId },
      });
      if (!invoice) {
        const err = new Error('Invoice not found');
        err.status = 404;
        throw err;
      }

      // CREDIT reduces the invoice total; DEBIT increases it
      const lineAmount = type === 'CREDIT'
        ? -BigInt(Math.abs(amountMinor))
        : BigInt(Math.abs(amountMinor));

      await tx.invoiceLine.create({
        data: {
          invoiceId,
          description: `${type} adjustment: ${reason}`,
          quantity: 1,
          unitAmountMinor: lineAmount,
          amountMinor: lineAmount,
        },
      });

      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          totalMinor: BigInt(invoice.totalMinor) + lineAmount,
        },
      });
    }

    return ledgerEntry;
  });

  return { adjustment: result };
}

export async function listAdjustments(organizationId, filters) {
  return await repo.findAdjustmentsByOrganization(organizationId, filters);
}

export async function getAdjustment(adjustmentId, organizationId) {
  const adjustment = await repo.findAdjustmentById(adjustmentId, organizationId);
  if (!adjustment) {
    const error = new Error('Adjustment not found');
    error.status = 404;
    throw error;
  }
  return adjustment;
}
