import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { XServiceTokenGuard } from '../x-service-token.guard';

describe('XServiceTokenGuard', () => {
  const configService = {
    get: jest.fn(),
  } as unknown as ConfigService;
  const guard = new XServiceTokenGuard(configService);

  const createContext = (headerValue?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          header: () => headerValue,
        }),
      }),
    }) as unknown as ExecutionContext;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows requests with a valid token', () => {
    configService.get = jest.fn().mockReturnValue('very-secure-token');
    const context = createContext('very-secure-token');
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects requests with invalid token', () => {
    configService.get = jest.fn().mockReturnValue('secure-token');
    const context = createContext('invalid-value');
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects when header missing', () => {
    configService.get = jest.fn().mockReturnValue('secure-token');
    const context = createContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('rejects when SERVICE_TOKEN unset', () => {
    configService.get = jest.fn().mockReturnValue(undefined);
    const context = createContext('value');
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
