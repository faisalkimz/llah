import { apiRequest } from './client';

export async function getApiKeys(token, orgId) {
  return apiRequest('/api-keys', {}, { token, orgId });
}

export async function createApiKey(token, orgId, name) {
  return apiRequest(
    '/api-keys',
    { method: 'POST', body: JSON.stringify({ name }) },
    { token, orgId },
  );
}

export async function revokeApiKey(token, orgId, id) {
  return apiRequest(`/api-keys/${id}`, { method: 'DELETE' }, { token, orgId });
}

export async function getEvents(token, orgId, { limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  return apiRequest(`/event-log?${params.toString()}`, {}, { token, orgId });
}

export async function getWebhookEndpoints(token, orgId) {
  return apiRequest('/webhooks-outbound/endpoints', {}, { token, orgId });
}

export async function getWebhookDeliveries(token, orgId, { limit = 20 } = {}) {
  const params = new URLSearchParams({ limit: String(limit) });
  return apiRequest(`/webhooks-outbound/deliveries?${params.toString()}`, {}, { token, orgId });
}

// Used by DeveloperScreen "Quick stats". May 404 in some setups; callers degrade to "—".
export async function getDeveloperOverview(token, orgId) {
  return apiRequest('/developer/overview', {}, { token, orgId });
}
