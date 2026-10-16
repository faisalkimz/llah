import prisma from '../../lib/prisma.js';
import * as repo from './repository.js';

// Valid status transitions.
// SUCCEEDED can transition to REFUNDED / PARTIALLY_REFUNDED (via the refund pipeline).
// FAILED is terminal.
const VALID_TRANSITIONS = {
  PENDING: ['SUCCEEDED', 'FAILED'],
  SUCCEEDED: ['REFUNDED', 'PARTIALLY_REFUNDED']
};

function isValidTransition(from, to) {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export async function createPayment(organizationId, paymentData) {
  return await repo.createPayment({
    ...paymentData,
    organizationId,
    status: 'PENDING'
  });
}

export async function listPayments(organizationId, filters) {
  return await repo.findPaymentsByOrganization(organizationId, filters);
}

export async function getPayment(paymentId, organizationId) {
  const payment = await repo.findPaymentById(paymentId, organizationId);
  if (!payment) {
    const error = new Error('Payment not found');
    error.status = 404;
    throw error;
  }
  return payment;
}

/**
 * Update payment status, enforcing the state machine.
 * PENDING → SUCCEEDED | FAILED
 * SUCCEEDED and FAILED are terminal states.
 *
 * When transitioning to SUCCEEDED:
 *   - Fetch the linked Invoice
 *   - Add payment.amountMinor to invoice.amountPaidMinor
 *   - If amountPaidMinor >= totalMinor, mark invoice as PAID
 */
export async function updatePayment(paymentId, organizationId, updates) {
  const payment = await repo.findPaymentById(paymentId, organizationId);
  if (!payment) {
    const error = new Error('Payment not found');
    error.status = 404;
    throw error;
  }

  const { status } = updates;

  if (status && status !== payment.status) {
    if (!isValidTransition(payment.status, status)) {
      const err = new Error(`Invalid status transition: ${payment.status} → ${status}`);
      err.status = 422;
      throw err;
    }
  }

  // Apply the payment update and reconcile invoice atomically
  const updated = await prisma.$transaction(async (tx) => {
    const result = await repo.updatePaymentTx(tx, paymentId, organizationId, updates);

    // Reconcile invoice when payment succeeds
    if (status === 'SUCCEEDED' && payment.invoiceId) {
      const invoice = await tx.invoice.findFirst({
        where: { id: payment.invoiceId, organizationId }
      });

      if (invoice) {
        const newAmountPaid = BigInt(invoice.amountPaidMinor) + BigInt(payment.amountMinor);
        const isPaid = newAmountPaid >= BigInt(invoice.totalMinor);

        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaidMinor: newAmountPaid,
            ...(isPaid ? { status: 'PAID', paidAt: new Date() } : {})
          }
        });
      }
    }

    return result;
  });

  return updated;
}
