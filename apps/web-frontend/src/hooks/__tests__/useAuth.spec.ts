import { act, renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem(key: string) {
      return store[key] ?? null;
    },
    setItem(key: string, value: string) {
      store[key] = value;
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
  };
})();

type GlobalWithFetch = typeof globalThis & { fetch: jest.Mock };

describe('useAuth', () => {
  const globalWithFetch = global as GlobalWithFetch;

  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  beforeEach(() => {
    localStorageMock.clear();
    jest.restoreAllMocks();
    globalWithFetch.fetch = jest.fn();
  });

  it('stores token and fetches current user on login', async () => {
    const loginResponse = Promise.resolve({ ok: true, json: async () => ({ accessToken: 'tok' }) });
    const currentUserResponse = Promise.resolve({ ok: true, json: async () => ({ id: '1', email: 'me@example.com' }) });

    globalWithFetch.fetch
      .mockReturnValueOnce(loginResponse)
      .mockReturnValueOnce(currentUserResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'Secure123Password');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual({ id: '1', email: 'me@example.com' });
    });

    expect(localStorageMock.getItem('granter_token')).toBe('tok');
  });

  it('sets error when login fails', async () => {
    const failureResponse = Promise.resolve({ ok: false, json: async () => ({ message: 'Denied' }) });
    globalWithFetch.fetch.mockReturnValue(failureResponse);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(result.current.login('test@example.com', 'Secure123Password')).rejects.toThrow('Denied');
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Denied');
    });
  });
});
