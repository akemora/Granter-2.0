import { act, renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { fetchApi } from '../../lib/api';

jest.mock('../../lib/api', () => ({
  fetchApi: jest.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets user on successful login', async () => {
    const fetchApiMock = fetchApi as jest.Mock;
    fetchApiMock.mockRejectedValueOnce(new Error('Unauthorized'));
    fetchApiMock.mockResolvedValueOnce({ id: '1', email: 'me@example.com' });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    await act(async () => {
      await result.current.login('test@example.com', 'Secure123Password');
    });

    await waitFor(() => {
      expect(result.current.user).toEqual({ id: '1', email: 'me@example.com' });
    });
  });

  it('sets error when login fails', async () => {
    const fetchApiMock = fetchApi as jest.Mock;
    fetchApiMock.mockRejectedValueOnce(new Error('Unauthorized'));
    fetchApiMock.mockRejectedValueOnce(new Error('Denied'));

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
    });

    await act(async () => {
      await expect(result.current.login('test@example.com', 'Secure123Password')).rejects.toThrow('Denied');
    });

    await waitFor(() => {
      expect(result.current.error).toBe('Denied');
    });
  });
});
