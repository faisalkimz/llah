import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('llah_access_token');
    if (token) {
      // In a real app, you'd validate the token or fetch user info
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, tokens) => {
    setUser(userData);
    localStorage.setItem('llah_access_token', tokens.accessToken);
    localStorage.setItem('llah_refresh_token', tokens.refreshToken);
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('llah_refresh_token');
    
    // Call logout endpoint
    try {
      await fetch('http://localhost:4000/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('llah_access_token')}`
        },
        body: JSON.stringify({ refreshToken })
      });
    } catch (e) {
      // Logout locally even if request fails
    }

    setUser(null);
    localStorage.removeItem('llah_access_token');
    localStorage.removeItem('llah_refresh_token');
    navigate('/login');
  };

  const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('llah_refresh_token');
    
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetch('http://localhost:4000/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        logout();
        return null;
      }

      const { data } = await response.json();
      localStorage.setItem('llah_access_token', data.tokens.accessToken);
      localStorage.setItem('llah_refresh_token', data.tokens.refreshToken);
      
      return data.tokens.accessToken;
    } catch (e) {
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
