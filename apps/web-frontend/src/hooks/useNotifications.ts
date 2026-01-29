'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/api';
import { NotificationItem } from '@/types';

export function useNotifications(limit: number = 5) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi(`/notifications?limit=${limit}`);
      setItems((data as NotificationItem[]) ?? []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar alertas');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
  }, [load]);

  return { items, isLoading, error, refresh: load };
}
