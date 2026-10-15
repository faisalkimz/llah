import prisma from '../../lib/prisma.js';
import * as repo from './repository.js';
import * as paymentsRepo from '../payments/repository.js';
import * as ledgerRepo from '../ledger/repository.js';

/**
 * createRefund
 *
 * Validates the payment state and refund amount, creates the Refund record,
 * posts a LedgerEntry, and reconciles the linked invoice.
 *
 * @param {string} orgId
 * @param {{ paymentId, amountMinor, reason? }} params
 */
export async function createRefund(orgId, { paymentId, amountMinor, reason }) {
  // 1. Fetch the payment — must belong to this org
  const payment = await paymentsRepo.findPaymentById(paymentId, orgId);
  if (!payment) {
    const err = new Error('Payment not found');
    err.status = 404;
    throw err;
  }

  // 2. Payment must be in SUCCEEDED state
  if (payment.status !== 'SUCCEEDED') {
    const err = new Error(`Cannot refund a payment in ${payment.status} state`);
    err.status = 422;
    throw err;
  }

  // 3. Validate amountMinor <= payment.amountMinor (integer comparison)
  const refundAmount = BigInt(amountMinor);
  const paymentAmount = BigInt(payment.amountMinor);

  if (refundAmount > paymentAmount) {
    const err = new Error('Refund amount exceeds payment amount');
    err.status = 422;
    throw err;
  }

  // 4. Sum existing refunds for this payment and validate no over-refund
  const existingRefunds = await prisma.refund.findMany({
    where: { paymentId },
    select: { amountMinor: true },
  });
  const existingTotal = existingRefunds.reduce(
    (sum, r) => sum + BigInt(r.amountMinor),
    BigInt(0),
  );

  if (existingTotal + refundAmount > paymentAmount) {
    const err = new Error(
      `Refund would exceed payment amount. Already refunded: ${existingTotal}, payment: ${paymentAmount}`,
    );
    err.status = 422;
    throw err;
  }

  // 5. Run the rest in a transaction
  const refund = await prisma.$transaction(async (tx) => {
    // Create Refund record with status PENDING
    const newRefund = await tx.refund.create({
      data: {
        paymentId,
        amountMinor: refundAmount,
        reason: reason ?? null,
      },
      include: {
        payment: {
          include: {
            invoice: { include: { customer: true } },
          },
        },
      },
    });

    // Post LedgerEntry: type REFUND (CREDIT direction — money going back to customer)
    await tx.ledgerEntry.create({
      data: {
        organizationId: orgId,
        customerId: payment.invoice?.customerId ?? null,
        type: 'REFUND',
        currency: payment.currency ?? 'USD',
        amountMinor: refundAmount,
        referenceType: 'Refund',
        referenceId: newRefund.id,
        description: reason ? `Refund: ${reason}` : `Refund for payment ${paymentId}`,
      },
    });

    // Reconcile linked invoice if present
    if (payment.invoiceId) {
      const invoice = await tx.invoice.findUnique({
        where: { id: payment.invoiceId },
      });

      if (invoice) {
        const newAmountPaid = BigInt(invoice.amountPaidMinor) - refundAmount;
        // Clamp to 0 (should not go negative but be safe)
        const clampedAmountPaid = newAmountPaid < BigInt(0) ? BigInt(0) : newAmountPaid;

        // If amountPaidMinor < totalAmountMinor, revert invoice to OPEN
        const newStatus =
          clampedAmountPaid < BigInt(invoice.totalMinor) && invoice.status === 'PAID'
            ? 'OPEN'
            : invoice.status;

        await tx.invoice.update({
          where: { id: payment.invoiceId },
          data: {
            amountPaidMinor: clampedAmountPaid,
            status: newStatus,
            // Clear paidAt if reverting to OPEN
            ...(newStatus === 'OPEN' ? { paidAt: null } : {}),
          },
        });
      }
    }

    return newRefund;
  });

  return refund;
}

/**
 * processRefund
 *
 * Advances a refund to SUCCEEDED status and updates the parent payment status
 * (PARTIALLY_REFUNDED when some amount remains; REFUNDED when fully refunded).
 * Scoped to the caller's organization through the payment relation.
 *
 * @param {string} refundId
 * @param {string} organizationId
 */
export async function processRefund(refundId, organizationId) {
  // Fetch via the payment relation so we validate org ownership
  const existing = await prisma.refund.findFirst({
    where: {
      id: refundId,
      payment: { organizationId },
    },
    include: {
      payment: {
        include: {
          invoice: { include: { customer: true } },
          refunds: { select: { amountMinor: true, status: true } },
        },
      },
    },
  });

  if (!existing) {
    const err = new Error('Refund not found');
    err.status = 404;
    throw err;
  }

  if (existing.status === 'SUCCEEDED') {
    const err = new Error('Refund is already in SUCCEEDED state');
    err.status = 422;
    throw err;
  }

  // Determine new payment status after this refund succeeds
  const succeededRefundTotal = existing.payment.refunds
    .filter((r) => r.status === 'SUCCEEDED' || r.id === refundId)
    .reduce((sum, r) => sum + BigInt(r.amountMinor), BigInt(0));
  const paymentAmount = BigInt(existing.payment.amountMinor);
  const newPaymentStatus =
    succeededRefundTotal >= paymentAmount ? 'REFUNDED' : 'PARTIALLY_REFUNDED';

  const refund = await prisma.$transaction(async (tx) => {
    const updated = await tx.refund.update({
      where: { id: refundId },
      data: { status: 'SUCCEEDED' },
      include: {
        payment: {
          include: {
            invoice: { include: { customer: true } },
          },
        },
      },
    });

    await tx.payment.update({
      where: { id: existing.paymentId },
      data: { status: newPaymentStatus },
    });

    return updated;
  });

  return refund;
}

export async function listRefunds(organizationId, filters) {
  return await repo.findRefundsByOrganization(organizationId, filters);
}

export async function getRefund(refundId, organizationId) {
  const refund = await repo.findRefundById(refundId, organizationId);
  if (!refund) {
    const error = new Error('Refund not found');
    error.status = 404;
    throw error;
  }
  return refund;
}
