import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';
import { useAuth } from '../../../hooks/useAuth';

jest.mock('../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('LoginForm', () => {
  const loginMock = jest.fn();

  beforeEach(() => {
    loginMock.mockResolvedValue(undefined);
    (useAuth as jest.Mock).mockReturnValue({
      login: loginMock,
      register: jest.fn(),
      logout: jest.fn(),
      user: null,
      isLoading: false,
      error: null,
    });
  });

  it('submits credentials and redirects on success', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Secure123Password' } });

    fireEvent.submit(screen.getByRole('form'));

    await waitFor(() => expect(loginMock).toHaveBeenCalledWith('test@example.com', 'Secure123Password'));
    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('displays error message when provided by hook', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      user: null,
      isLoading: false,
      error: 'Denied',
    });

    render(<LoginForm />);
    expect(screen.getByText(/denied/i)).toBeInTheDocument();
  });
});
