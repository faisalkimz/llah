import Constants from 'expo-constants';
import { Platform } from 'react-native';

// The phone must call this PC, not a stale LAN address.
// Expo already knows the host it used to load the bundle.
function apiOrigin() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return String(fromEnv).replace(/\/$/, '');

  const raw =
    Constants.expoGoConfig?.debuggerHost ||
    Constants.expoConfig?.hostUri ||
    '';
  let host = String(raw).split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    host = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  }
  return `http://${host}:4000/v1`;
}

export async function apiRequest(path, options = {}, { token, orgId } = {}) {
  const origin = apiOrigin();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(orgId ? { 'x-organization-id': orgId } : {}),
    ...(options.headers || {}),
  };

  let response;
  try {
    response = await fetch(`${origin}${path}`, {
      ...options,
      headers,
    });
  } catch (e) {
    const detail = e?.message || 'Network request failed';
    const timedOut = /timed out/i.test(detail);
    const err = new Error(
      timedOut
        ? `The API at ${origin} did not respond. Keep the API running, and keep the phone on the same Wi-Fi as this computer.`
        : `Could not reach the API at ${origin}. ${detail}`,
    );
    err.cause = e;
    throw err;
  }

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
