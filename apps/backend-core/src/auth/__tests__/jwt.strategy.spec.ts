import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtPayload, JwtStrategy } from '../strategies/jwt.strategy';

const makeConfig = (secret?: string): ConfigService =>
  ({
    get: jest.fn().mockReturnValue(secret),
  }) as unknown as ConfigService;

describe('JwtStrategy', () => {
  it('throws when JWT_SECRET is missing', () => {
    expect(() => new JwtStrategy(makeConfig(undefined))).toThrow(
      'JwtStrategy requires a JWT_SECRET of at least 32 characters',
    );
  });

  it('throws when JWT_SECRET is too short', () => {
    expect(() => new JwtStrategy(makeConfig('short'))).toThrow(
      'JwtStrategy requires a JWT_SECRET of at least 32 characters',
    );
  });

  it('validates payload with required fields', () => {
    const strategy = new JwtStrategy(makeConfig('a'.repeat(32)));
    const payload: JwtPayload = {
      sub: '123',
      email: 'test@example.com',
      exp: Date.now(),
      iat: Date.now(),
      type: 'access',
    };
    expect(strategy.validate(payload)).toEqual({
      id: '123',
      email: 'test@example.com',
    });
  });

  it('throws when payload is missing sub field', () => {
    const strategy = new JwtStrategy(makeConfig('a'.repeat(32)));
    expect(() =>
      strategy.validate({
        email: 'test@example.com',
        exp: Date.now(),
        iat: Date.now(),
      } as JwtPayload),
    ).toThrow(UnauthorizedException);
  });

  it('throws when payload contains invalid types', () => {
    const strategy = new JwtStrategy(makeConfig('a'.repeat(32)));
    expect(() =>
      strategy.validate({
        sub: 123 as unknown as string,
        email: true as unknown as string,
        exp: Date.now(),
        iat: Date.now(),
      } as JwtPayload),
    ).toThrow(UnauthorizedException);
  });
});
