import * as repo from './repository.js';

export async function createInvoice(organizationId, invoiceData) {
  return await repo.createInvoice({
    ...invoiceData,
    organizationId,
    status: 'DRAFT'
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
  return await repo.updateInvoice(invoiceId, organizationId, updates);
}

export async function finalizeInvoice(invoiceId, organizationId) {
  return await updateInvoice(invoiceId, organizationId, {
    status: 'OPEN',
    issuedAt: new Date()
  });
}
