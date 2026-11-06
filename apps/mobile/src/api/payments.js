import { apiRequest } from './client';

export async function getPayments(token, orgId, { limit = 20, offset = 0, status = '' } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status) params.set('status', status);
  return apiRequest(`/payments?${params.toString()}`, {}, { token, orgId });
}

export async function getPayment(token, orgId, id) {
  return apiRequest(`/payments/${id}`, {}, { token, orgId });
}
