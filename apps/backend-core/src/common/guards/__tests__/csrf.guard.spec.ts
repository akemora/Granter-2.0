import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CsrfGuard } from '../csrf.guard';
import { ACCESS_TOKEN_COOKIE, CSRF_COOKIE, CSRF_HEADER, REFRESH_TOKEN_COOKIE } from '../../../auth/auth.constants';

const makeContext = (request: Record<string, unknown>): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  }) as unknown as ExecutionContext;

describe('CsrfGuard', () => {
  const guard = new CsrfGuard();

  it('allows safe HTTP methods', () => {
    const context = makeContext({ method: 'GET' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows auth bootstrap routes', () => {
    const context = makeContext({ method: 'POST', path: '/auth/login' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows requests with service token', () => {
    const context = makeContext({
      method: 'POST',
      headers: { 'x-service-token': 'token' },
    });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows requests without auth cookies', () => {
    const context = makeContext({ method: 'POST', cookies: {} });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects when csrf token is missing', () => {
    const context = makeContext({
      method: 'POST',
      cookies: { [ACCESS_TOKEN_COOKIE]: 'access' },
      headers: {},
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects when csrf token does not match', () => {
    const context = makeContext({
      method: 'POST',
      cookies: { [REFRESH_TOKEN_COOKIE]: 'refresh', [CSRF_COOKIE]: 'cookie-token' },
      headers: { [CSRF_HEADER]: 'header-token' },
    });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows when csrf token matches', () => {
    const context = makeContext({
      method: 'POST',
      cookies: { [ACCESS_TOKEN_COOKIE]: 'access', [CSRF_COOKIE]: 'token' },
      headers: { [CSRF_HEADER]: 'token' },
    });
    expect(guard.canActivate(context)).toBe(true);
  });
});
