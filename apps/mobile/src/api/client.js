import { Platform } from 'react-native';

const BASE = Platform.OS === 'android'
  ? 'http://10.0.2.2:4000/v1'
  : 'http://localhost:4000/v1';

export async function apiRequest(path, options = {}, { token, orgId } = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(orgId ? { 'x-organization-id': orgId } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = body?.error?.message || body?.message || 'Request failed';
    const code = body?.error?.code || 'UNKNOWN_ERROR';
    const err = new Error(msg);
    err.code = code;
    err.status = response.status;
    throw err;
  }

  return body.data;
}
