import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, getMe } from '../api/auth';
import { getOrganizations } from '../api/organizations';
import { getTokens, setTokens, clearTokens, getOrgId, setOrg, getOrgName } from '../store/auth';

const AuthContext = createContext(null);

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1];
    // atob is available in React Native's Hermes engine
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orgId, setOrgId] = useState(null);
  const [orgName, setOrgNameState] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { access } = await getTokens();
        if (access) {
          const payload = decodeJwtPayload(access);
          if (payload && payload.exp * 1000 > Date.now()) {
            const me = await getMe(access);
            setUser(me);
            const storedOrgId = await getOrgId();
            const storedOrgName = await getOrgName();
            if (storedOrgId) {
              setOrgId(storedOrgId);
              setOrgNameState(storedOrgName);
            }
          } else {
            await clearTokens();
          }
        }
      } catch {
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(email, password) {
    const result = await apiLogin(email, password);
    const { tokens, user: userData } = result;
    await setTokens(tokens.accessToken, tokens.refreshToken);
    setUser(userData);
    // Fetch orgs and auto-select first
    try {
      const orgs = await getOrganizations(tokens.accessToken);
      const list = Array.isArray(orgs) ? orgs : (orgs?.organizations ?? []);
      if (list.length > 0) {
        const first = list[0];
        await setOrg(first.id, first.name);
        setOrgId(first.id);
        setOrgNameState(first.name);
      }
    } catch {
      // org fetch is best-effort; login still succeeds
    }
  }

  async function logout() {
    await clearTokens();
    setUser(null);
    setOrgId(null);
    setOrgNameState(null);
  }

  async function selectOrg(id, name) {
    await setOrg(id, name);
    setOrgId(id);
    setOrgNameState(name);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        orgId,
        orgName,
        login,
        logout,
        selectOrg,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
