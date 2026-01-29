import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL,
  CSRF_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_DAYS,
} from '../auth.constants';

const parseAccessTokenTtl = (value: string): number => {
  if (value.endsWith('m')) {
    return Number(value.replace('m', '')) * 60 * 1000;
  }
  if (value.endsWith('h')) {
    return Number(value.replace('h', '')) * 60 * 60 * 1000;
  }
  return 15 * 60 * 1000;
};

describe('AuthController', () => {
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    revokeRefreshToken: jest.fn(),
    getCurrentUser: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController(authService);
    jest.clearAllMocks();
  });

  it('returns a generic message on register without setting cookies', async () => {
    authService.register.mockResolvedValue(undefined);

    const result = await controller.register({ email: 'test@example.com', password: 'Secure123Password' });

    expect(result.message).toContain('iniciar sesión');
  });

  it('sets auth cookies on login in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    authService.login.mockResolvedValue({
      user: { id: 'user-1', email: 'user@example.com' },
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    });

    const res = { cookie: jest.fn() } as any;
    await controller.login({ email: 'user@example.com', password: 'Secure123Password' }, res);

    const accessMaxAge = parseAccessTokenTtl(ACCESS_TOKEN_TTL);
    const refreshMaxAge = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      'access-token',
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'strict', maxAge: accessMaxAge, path: '/' }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      'refresh-token',
      expect.objectContaining({ httpOnly: true, secure: true, sameSite: 'strict', maxAge: refreshMaxAge, path: '/' }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      CSRF_COOKIE,
      expect.any(String),
      expect.objectContaining({ httpOnly: false, secure: true, sameSite: 'strict', maxAge: refreshMaxAge, path: '/' }),
    );

    process.env.NODE_ENV = originalEnv;
  });

  it('revokes refresh token and clears cookies on logout', async () => {
    authService.revokeRefreshToken.mockResolvedValue(undefined);
    const res = { cookie: jest.fn() } as any;

    await controller.logout({ cookies: { [REFRESH_TOKEN_COOKIE]: 'refresh-token' } }, res);

    expect(authService.revokeRefreshToken).toHaveBeenCalledWith('refresh-token');
    expect(res.cookie).toHaveBeenCalledWith(
      ACCESS_TOKEN_COOKIE,
      '',
      expect.objectContaining({ httpOnly: true, maxAge: 0, path: '/' }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE,
      '',
      expect.objectContaining({ httpOnly: true, maxAge: 0, path: '/' }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      CSRF_COOKIE,
      '',
      expect.objectContaining({ httpOnly: false, maxAge: 0, path: '/' }),
    );
  });
});
