import { getCsrfToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchApi(path: string, options?: RequestInit) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  const method = (options?.method ?? 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!res.ok) {
    const payload = isJson ? await res.json().catch(() => null) : null;
    const message = payload?.error?.message ?? payload?.message ?? res.statusText;
    throw new Error(message || `Failed to fetch ${path}: ${res.statusText}`);
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return null;
  }

  if (isJson) {
    const payload = await res.json();
    if (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload) {
      return (payload as { data: unknown }).data;
    }
    return payload;
  }

  const text = await res.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
