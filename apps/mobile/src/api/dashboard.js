import { apiRequest } from './client';

export function getRevenueStats(token, orgId) {
  return apiRequest('/revenue/stats', {}, { token, orgId });
}

export function getSubscriptionCount(token, orgId) {
  return apiRequest('/subscriptions?status=ACTIVE&limit=1', {}, { token, orgId });
}

export function getOpenInvoiceCount(token, orgId) {
  return apiRequest('/invoices?status=OPEN&limit=1', {}, { token, orgId });
}

export function getFailedPayments(token, orgId) {
  return apiRequest('/payments?status=FAILED&limit=5', {}, { token, orgId });
}

export function getNotifications(token, orgId) {
  return apiRequest('/notifications?limit=5', {}, { token, orgId });
}
