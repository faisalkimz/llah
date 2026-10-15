import * as repo from './repository.js';

/**
 * Generate the next invoice number for an org.
 * Format: INV-{first 6 chars of orgId}-{zero-padded 4-digit sequence}
 */
function buildInvoiceNumber(orgId, lastNumber) {
  let nextSeq = 1;
  if (lastNumber) {
    const parts = lastNumber.split('-');
    const parsed = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(parsed)) nextSeq = parsed + 1;
  }
  const prefix = orgId.slice(0, 6);
  return `INV-${prefix}-${String(nextSeq).padStart(4, '0')}`;
}

/**
 * Compute subtotalMinor from line items using integer arithmetic only.
 * quantity is treated as an integer (floored). unitAmountMinor must be integer.
 */
function computeSubtotal(lines) {
  return lines.reduce((sum, line) => {
    return sum + BigInt(Math.floor(Number(line.quantity))) * BigInt(line.unitAmountMinor);
  }, BigInt(0));
}

export async function createInvoice(organizationId, invoiceData) {
  const { lines, ...rest } = invoiceData;

  if (!lines || lines.length === 0) {
    const err = new Error('Invoice must have at least one line item');
    err.status = 422;
    throw err;
  }

  // Compute subtotal server-side — never trust caller-supplied total
  const subtotalMinor = computeSubtotal(lines);

  // Sequence the invoice number
  const lastNumber = await repo.findLastInvoiceNumber(organizationId);
  const invoiceNumber = buildInvoiceNumber(organizationId, lastNumber);

  return await repo.createInvoice({
    ...rest,
    organizationId,
    number: invoiceNumber,
    status: 'DRAFT',
    subtotalMinor,
    totalMinor: subtotalMinor,
    lines: lines.map((line) => ({
      description: line.description,
      quantity: line.quantity,
      unitAmountMinor: line.unitAmountMinor,
      amountMinor: BigInt(Math.floor(Number(line.quantity))) * BigInt(line.unitAmountMinor)
    }))
  });
}

export async function listInvoices(organizationId, filters) {
  return await repo.findInvoicesByOrganization(organizationId, filters);
}

export async function getInvoice(invoiceId, organizationId) {
  const invoice = await repo.findInvoiceById(invoiceId, organizationId);
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }
  return invoice;
}

export async function updateInvoice(invoiceId, organizationId, updates) {
  const invoice = await repo.findInvoiceById(invoiceId, organizationId);
  if (!invoice) {
    const error = new Error('Invoice not found');
    error.status = 404;
    throw error;
  }

  // Finalized (OPEN / PAID / VOID) invoices are immutable
  if (invoice.status !== 'DRAFT') {
    const err = new Error(`Cannot edit invoice in ${invoice.status} state`);
    err.status = 422;
    throw err;
  }

  return await repo.updateInvoice(invoiceId, organizationId, updates);
}

/**
 * Finalize an invoice: DRAFT → OPEN.
 * Sets finalizedAt (stored as issuedAt in the schema).
 */
export async function finalizeInvoice(invoiceId, organizationId) {
  const invoice = await repo.findInvoiceById(invoiceId, organizationId);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }
  if (invoice.status !== 'DRAFT') {
    const err = new Error(`Cannot finalize invoice in ${invoice.status} state`);
    err.status = 422;
    throw err;
  }
  return await repo.updateInvoice(invoiceId, organizationId, {
    status: 'OPEN',
    issuedAt: new Date()
  });
}

/**
 * Void an invoice: OPEN → VOID.
 * Only OPEN invoices can be voided.
 */
export async function voidInvoice(invoiceId, organizationId) {
  const invoice = await repo.findInvoiceById(invoiceId, organizationId);
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }
  if (invoice.status !== 'OPEN') {
    const err = new Error(`Cannot void invoice in ${invoice.status} state`);
    err.status = 422;
    throw err;
  }
  return await repo.updateInvoice(invoiceId, organizationId, {
    status: 'VOID'
  });
}
