'use client';

import { useEffect, useState, useCallback } from 'react';
import { api, setToken, getToken } from '@/lib/api';

const STORAGE_KEY = 'keepit:token';

export function useAuth() {
  const [token, setTokenState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setTokenState(getToken());
    setReady(true);

    const onUnauthorized = () => {
      setToken(null);
      setTokenState(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    };
    window.addEventListener('keepit:unauthorized', onUnauthorized);
    return () =>
      window.removeEventListener('keepit:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token } = await api.login({ email, password });
    setToken(token);
    setTokenState(token);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  return { token, ready, isAuthenticated: !!token, login, logout };
}

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}
