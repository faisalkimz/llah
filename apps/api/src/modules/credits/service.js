import prisma from '../../lib/prisma.js';
import * as repo from './repository.js';
import * as invoicesRepo from '../invoices/repository.js';
import * as ledgerRepo from '../ledger/repository.js';

export async function createCreditGrant(organizationId, grantData) {
  const { amountMinor, expiresAt } = grantData;

  // Validate amountMinor > 0
  if (!amountMinor || amountMinor <= 0) {
    const err = new Error('amountMinor must be a positive integer');
    err.status = 422;
    throw err;
  }

  // Validate expiresAt is in the future if provided
  if (expiresAt) {
    const expiry = new Date(expiresAt);
    if (expiry <= new Date()) {
      const err = new Error('expiresAt must be a future date');
      err.status = 422;
      throw err;
    }
  }

  return await repo.createCreditGrant({
    ...grantData,
    organizationId
  });
}

export async function listCreditGrants(organizationId, filters) {
  return await repo.findCreditGrantsByOrganization(organizationId, filters);
}

export async function getCreditGrant(grantId, organizationId) {
  const grant = await repo.findCreditGrantById(grantId, organizationId);
  if (!grant) {
    const error = new Error('Credit grant not found');
    error.status = 404;
    throw error;
  }
  return grant;
}

/**
 * Return active (non-expired, remaining balance > 0) credit grants for a customer.
 */
export async function getActiveCredits(organizationId, customerId) {
  return await repo.findActiveCredits(organizationId, customerId);
}

/**
 * Apply a credit grant to an invoice.
 *
 * Validates:
 *  - Credit grant belongs to the same customer as the invoice
 *  - amountToApplyMinor <= creditGrant.remainingMinor
 *  - Invoice is in DRAFT or OPEN state
 *
 * Side effects:
 *  - Decrements creditGrant.remainingMinor
 *  - Creates an InvoiceLine of type CREDIT on the invoice (negative amount)
 *  - Posts a LedgerEntry of type CREDIT
 *  - Returns updated invoice
 */
export async function applyCreditToInvoice(organizationId, creditGrantId, invoiceId, amountToApplyMinor) {
  // Fetch credit grant
  const grant = await repo.findCreditGrantById(creditGrantId, organizationId);
  if (!grant) {
    const err = new Error('Credit grant not found');
    err.status = 404;
    throw err;
  }

  // Fetch invoice
  const invoice = await invoicesRepo.findInvoiceById(invoiceId, organizationId);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  // Validate same customer
  if (grant.customerId !== invoice.customerId) {
    const err = new Error('Credit grant and invoice belong to different customers');
    err.status = 422;
    throw err;
  }

  // Validate amount
  const applyAmount = BigInt(amountToApplyMinor);
  if (applyAmount <= BigInt(0)) {
    const err = new Error('amountToApplyMinor must be positive');
    err.status = 422;
    throw err;
  }
  if (applyAmount > BigInt(grant.remainingMinor)) {
    const err = new Error('amountToApplyMinor exceeds credit grant remaining balance');
    err.status = 422;
    throw err;
  }

  // Validate invoice state
  if (invoice.status !== 'DRAFT' && invoice.status !== 'OPEN') {
    const err = new Error(`Cannot apply credit to invoice in ${invoice.status} state`);
    err.status = 422;
    throw err;
  }

  // Decrement credit grant
  await repo.decrementCreditGrant(creditGrantId, amountToApplyMinor);

  // Add credit line to invoice and reduce totalMinor
  const updatedInvoice = await invoicesRepo.addCreditLine(invoiceId, organizationId, {
    description: `Credit applied from grant ${creditGrantId}`,
    amountToApplyMinor
  });

  // Post ledger entry
  await ledgerRepo.createLedgerEntry({
    organizationId,
    customerId: invoice.customerId,
    type: 'CREDIT',
    currency: invoice.currency ?? 'USD',
    amountMinor: applyAmount,
    referenceType: 'Invoice',
    referenceId: invoiceId,
    description: `Credit grant ${creditGrantId} applied to invoice ${invoice.number ?? invoiceId}`
  });

  return updatedInvoice;
}
