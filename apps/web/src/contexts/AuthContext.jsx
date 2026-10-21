import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const accessToken = localStorage.getItem('llah_access_token');

    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      // Decode token to get basic user info
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      // Check token expiry
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }
      const baseUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        emailVerified: payload.emailVerified || false,
        isSuperAdmin: false,
      };
      setUser(baseUser);
      setIsAuthenticated(true);

      // Fetch full profile including isSuperAdmin (non-blocking)
      api('/auth/me').then(res => {
        if (res.success && res.data) {
          setUser(prev => ({ ...prev, ...res.data }));
        }
      }).catch(() => {
        // non-critical — basic user info already set from token
      });
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }

  function login(tokens, userData) {
    localStorage.setItem('llah_access_token', tokens.accessToken);
    localStorage.setItem('llah_refresh_token', tokens.refreshToken);
    setUser({ isSuperAdmin: false, ...userData });
    setIsAuthenticated(true);

    // Fetch full profile after login
    api('/auth/me').then(res => {
      if (res.success && res.data) {
        setUser(prev => ({ ...prev, ...res.data }));
      }
    }).catch(() => {});
  }

  function logout() {
    localStorage.removeItem('llah_access_token');
    localStorage.removeItem('llah_refresh_token');
    setUser(null);
    setIsAuthenticated(false);
  }

  function updateUser(updates) {
    setUser(prev => ({ ...prev, ...updates }));
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
    checkAuth,
    api,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
