import { apiRequest } from './client';

export function login(email, password) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function forgotPassword(email) {
  return apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function getMe(token) {
  return apiRequest('/auth/me', {}, { token });
}

// Active sessions for the signed-in user. Token only, no org id required.
export function getSessions(token) {
  return apiRequest('/auth/sessions', {}, { token });
}
