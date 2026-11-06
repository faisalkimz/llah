import { apiRequest } from './client';

export async function getNotifications(token, orgId, { limit = 20, offset = 0, read = '' } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  // The API transforms read === 'true' to a boolean filter; 'false' => unread.
  if (read !== '') params.set('read', String(read));
  return apiRequest(`/notifications?${params.toString()}`, {}, { token, orgId });
}

export async function markNotificationRead(token, orgId, id) {
  return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' }, { token, orgId });
}

export async function markAllRead(token, orgId) {
  return apiRequest('/notifications/read-all', { method: 'POST' }, { token, orgId });
}

export async function getUnreadCount(token, orgId) {
  return apiRequest('/notifications/unread-count', {}, { token, orgId });
}
