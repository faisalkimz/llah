import { Platform } from 'react-native';

// Android emulator: 10.0.2.2 routes to host machine's localhost
// iOS on real device: must use the PC's LAN IP (phone and PC must be on same WiFi)
// iOS simulator: localhost works fine
const getBaseUrl = () => {
  if (Platform.OS === 'android') return 'http://10.0.2.2:4000/v1';
  // For real iOS device, use your PC's local network IP
  // Run `ipconfig` on PC and find your WiFi IPv4 address
  return 'http://192.168.1.171:4000/v1';
};

const BASE = getBaseUrl();

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
