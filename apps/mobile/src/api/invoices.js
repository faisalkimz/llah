import { apiRequest } from './client';

export async function getInvoices(token, orgId, { limit = 20, offset = 0, status = '' } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status) params.set('status', status);
  return apiRequest(`/invoices?${params.toString()}`, {}, { token, orgId });
}

export async function getInvoice(token, orgId, id) {
  return apiRequest(`/invoices/${id}`, {}, { token, orgId });
}

export async function finalizeInvoice(token, orgId, id) {
  return apiRequest(`/invoices/${id}/finalize`, { method: 'POST' }, { token, orgId });
}

export async function voidInvoice(token, orgId, id) {
  return apiRequest(`/invoices/${id}/void`, { method: 'POST' }, { token, orgId });
}
