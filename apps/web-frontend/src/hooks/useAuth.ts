'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchApi } from '../lib/api';

export interface AuthUser {
  id: string;
  email: string;
}

type RegisterResponse = {
  message: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const body = (await fetchApi('/auth/me')) as AuthUser;
      setUser(body);
    } catch {
      setUser(null);
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const body = (await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })) as AuthUser;
        if (body?.email) {
          setUser(body);
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
    [fetchCurrentUser],
  );

  const register = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      setError(null);
      try {
        return (await fetchApi('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        })) as RegisterResponse;
      } catch (err) {
        setError((err as Error).message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser().finally(() => setIsReady(true));
  }, [fetchCurrentUser]);

  return { user, login, register, logout, isLoading, error, isReady };
}
