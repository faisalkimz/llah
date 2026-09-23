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

  let response = await makeRequest(token);

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
    return {
      success: false,
      error: {
        message: body?.error?.message || body?.message || 'Request failed',
        code: body?.error?.code || 'UNKNOWN_ERROR'
      }
    };
  }
  
  return {
    success: true,
    data: body.data,
    meta: body.meta
  };
}
