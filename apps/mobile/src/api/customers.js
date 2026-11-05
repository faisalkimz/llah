import { apiRequest } from './client';

export async function getCustomers(token, orgId, { limit = 20, offset = 0, search = '' } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (search) params.set('search', search);
  return apiRequest(`/customers?${params.toString()}`, {}, { token, orgId });
}

export async function getCustomer(token, orgId, id) {
  return apiRequest(`/customers/${id}`, {}, { token, orgId });
}

export async function createCustomer(token, orgId, data) {
  return apiRequest('/customers', { method: 'POST', body: JSON.stringify(data) }, { token, orgId });
}

export async function updateCustomer(token, orgId, id, data) {
  return apiRequest(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }, { token, orgId });
}
