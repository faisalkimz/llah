import { apiRequest } from './client';

export async function getSubscriptions(token, orgId, { limit = 20, offset = 0, status = '' } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  if (status) params.set('status', status);
  return apiRequest(`/subscriptions?${params.toString()}`, {}, { token, orgId });
}

export async function getSubscription(token, orgId, id) {
  return apiRequest(`/subscriptions/${id}`, {}, { token, orgId });
}

export async function cancelSubscription(token, orgId, id, { immediate = false } = {}) {
  return apiRequest(
    `/subscriptions/${id}/cancel`,
    { method: 'POST', body: JSON.stringify({ immediate }) },
    { token, orgId }
  );
}
