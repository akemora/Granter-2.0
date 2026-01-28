'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface AuthUser {
  id: string;
  email: string;
}

type AuthResponse = {
  accessToken: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
const TOKEN_KEY = 'granter_token';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  });

  const saveToken = (value: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, value);
    }
    setToken(value);
  };

  const clearToken = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
    }
    setToken(null);
  };

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const authToken = token;
      if (!authToken) {
        throw new Error('Missing auth token');
      }

      const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
          ...(options.headers ?? {}),
        },
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || 'Request failed');
      }

      return response.json();
    },
    [token],
  );

  const fetchCurrentUser = useCallback(async () => {
    try {
      const body = await fetchWithAuth('/users/me');
      setUser(body);
    } catch (err) {
      setUser(null);
    }
  }, [fetchWithAuth]);

  const persistUser = useCallback(
    async (tokenValue: string) => {
      saveToken(tokenValue);
      await fetchCurrentUser();
    },
    [fetchCurrentUser],
  );

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || 'Login failed');
        }

        const body = (await response.json()) as AuthResponse;
        await persistUser(body.accessToken);
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persistUser],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.message || 'Registration failed');
        }

        const body = (await response.json()) as AuthResponse;
        await persistUser(body.accessToken);
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [persistUser],
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    fetchCurrentUser();
  }, [token, fetchCurrentUser]);

  return { user, login, register, logout, isLoading, error };
}
