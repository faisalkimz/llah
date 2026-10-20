const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

/**
 * Map API error codes to user-friendly messages.
 * Falls back to the server message if no mapping exists.
 */
const ERROR_MESSAGES = {
  // Auth
  INVALID_CREDENTIALS: 'The email or password you entered is incorrect. Please try again.',
  EMAIL_EXISTS: 'An account with this email address already exists. Try signing in instead.',
  INVALID_REFRESH_TOKEN: 'Your session is no longer valid. Please sign in again.',
  REFRESH_TOKEN_EXPIRED: 'Your session has expired. Please sign in again.',
  TOKEN_REUSE_DETECTED: 'A security issue was detected with your session. All sessions have been logged out. Please sign in again.',
  INVALID_VERIFICATION_TOKEN: 'This verification link is invalid. Please request a new one.',
  VERIFICATION_TOKEN_EXPIRED: 'This verification link has expired. Please request a new one.',
  INVALID_RESET_TOKEN: 'This password reset link is invalid. Please request a new one.',
  RESET_TOKEN_USED: 'This password reset link has already been used. Please request a new one if needed.',
  RESET_TOKEN_EXPIRED: 'This password reset link has expired. Please request a new one.',
  EMAIL_ALREADY_VERIFIED: 'Your email address is already verified.',
  SESSION_NOT_FOUND: 'Session not found. It may have already been revoked.',
  USER_NOT_FOUND: 'Account not found.',

  // Validation
  VALIDATION_ERROR: 'Please check your input and try again.',

  // General
  UNAUTHORIZED: 'You need to sign in to access this resource.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  INTERNAL_ERROR: 'Something went wrong on our end. Please try again in a moment.',
};

/**
 * Convert a raw error (from catch block or API response) into a user-friendly message.
 */
export function friendlyError(error) {
  // Network / fetch failures
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Unable to connect to the server. Please check your internet connection and make sure the API is running.';
  }
  if (error instanceof TypeError && error.message.includes('NetworkError')) {
    return 'A network error occurred. Please check your connection and try again.';
  }

  // API error objects { code, message }
  if (error?.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // Plain error with message
  if (error?.message) {
    // Check if the message matches a known pattern
    const msg = error.message;
    if (msg.includes('fetch') || msg.includes('network')) {
      return 'Unable to connect to the server. Please check your connection.';
    }
    if (msg.includes('JSON')) {
      return 'Received an unexpected response from the server. Please try again.';
    }
    // Return the server message as-is if it looks like a real message
    return msg;
  }

  return 'An unexpected error occurred. Please try again.';
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('llah_refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!response.ok) {
    // Clear tokens and redirect to login
    localStorage.removeItem('llah_access_token');
    localStorage.removeItem('llah_refresh_token');
    window.location.href = '/login';
    throw new Error('Failed to refresh token');
  }

  const { data } = await response.json();
  localStorage.setItem('llah_access_token', data.tokens.accessToken);
  localStorage.setItem('llah_refresh_token', data.tokens.refreshToken);
  
  return data.tokens.accessToken;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('llah_access_token');
  const organizationId = localStorage.getItem('current_organization_id');
  
  const makeRequest = async (accessToken) => {
    return fetch(`${BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(organizationId ? { 'x-organization-id': organizationId } : {}),
        ...(options.headers || {})
      }
    });
  };

  let response;
  try {
    response = await makeRequest(token);
  } catch (fetchError) {
    // Network error - no response from server
    return {
      success: false,
      error: {
        message: friendlyError(fetchError),
        code: 'NETWORK_ERROR'
      }
    };
  }

  // If 401 and we have a refresh token, try to refresh
  if (response.status === 401 && localStorage.getItem('llah_refresh_token')) {
    if (!isRefreshing) {
      isRefreshing = true;
      
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);
        
        // Retry original request with new token
        response = await makeRequest(newToken);
      } catch (e) {
        isRefreshing = false;
        throw e;
      }
    } else {
      // Wait for refresh to complete
      const newToken = await new Promise(resolve => {
        addRefreshSubscriber(resolve);
      });
      
      response = await makeRequest(newToken);
    }
  }

  const body = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const errorCode = body?.error?.code || 'UNKNOWN_ERROR';
    const serverMessage = body?.error?.message || body?.message || 'Request failed';
    
    return {
      success: false,
      error: {
        message: ERROR_MESSAGES[errorCode] || serverMessage,
        code: errorCode,
        serverMessage // keep original for debugging
      }
    };
  }
  
  return {
    success: true,
    data: body.data,
    meta: body.meta
  };
}
