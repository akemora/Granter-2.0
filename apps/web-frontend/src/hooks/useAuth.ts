'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCsrfToken } from '../lib/auth';

export interface AuthUser {
  id: string;
  email: string;
}

type AuthResponse = {
  accessToken: string;
};

type RegisterResponse = {
  message: string;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseResponse = useCallback(async <T,>(response: Response): Promise<T> => {
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.error?.message ?? payload?.message ?? 'Request failed';
      throw new Error(message);
    }
    if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) {
      return (payload as { data: T }).data;
    }
    return payload as T;
  }, []);

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers ?? {}),
        },
        credentials: 'include',
      });

      return parseResponse<AuthUser>(response);
    },
    [parseResponse],
  );

  const fetchCurrentUser = useCallback(async () => {
    try {
      const body = await fetchWithAuth('/auth/me');
      setUser(body);
    } catch {
      setUser(null);
    }
  }, [fetchWithAuth]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        });

        const body = await parseResponse<AuthUser | AuthResponse>(response);
        if ('email' in body) {
          setUser(body as AuthUser);
        } else {
          await fetchCurrentUser();
        }
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCurrentUser, parseResponse],
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
          credentials: 'include',
        });

        const body = await parseResponse<RegisterResponse>(response);
        return body;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchCurrentUser, parseResponse],
  );

  const logout = useCallback(async () => {
    try {
      const csrfToken = getCsrfToken();
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
        },
      });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser().finally(() => setIsReady(true));
  }, [fetchCurrentUser]);

  return { user, login, register, logout, isLoading, error, isReady };
}
