import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is logged in on mount
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
      // Decode token to get user info without a network call
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      // Check token expiry
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error('Token expired');
      }
      setUser({
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        emailVerified: payload.emailVerified || false,
      });
      setIsAuthenticated(true);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }

  function login(tokens, userData) {
    localStorage.setItem('llah_access_token', tokens.accessToken);
    localStorage.setItem('llah_refresh_token', tokens.refreshToken);
    
    setUser(userData);
    setIsAuthenticated(true);
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
    api
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
