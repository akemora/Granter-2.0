import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../auth.constants';

export interface JwtPayload {
  sub?: string;
  email?: string;
  exp?: number;
  iat?: number;
  type?: 'access' | 'refresh';
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private static readonly REQUIRED_FIELDS: Array<keyof JwtPayload> = ['sub', 'email', 'exp', 'iat'];

  private readonly logger: Logger;
  private static readonly SECRET_ERROR = 'JwtStrategy requires a JWT_SECRET of at least 32 characters';

  constructor(configService: ConfigService) {
    const logger = new Logger(JwtStrategy.name);
    const jwtSecret = configService.get<string>('jwtSecret');
    if (!jwtSecret || jwtSecret.length < 32) {
      logger.error('JWT secret is missing or too short (minimum 32 chars)');
      throw new Error(JwtStrategy.SECRET_ERROR);
    }

    const cookieExtractor = (request: Request): string | null => {
      return request?.cookies?.[ACCESS_TOKEN_COOKIE] ?? null;
    };

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromAuthHeaderAsBearerToken(), cookieExtractor]),
      secretOrKey: jwtSecret,
      ignoreExpiration: false,
    };

    super(options);
    this.logger = logger;
  }

  validate(payload: JwtPayload): { id: string; email: string } {
    const missingField = JwtStrategy.REQUIRED_FIELDS.find(
      (field) => typeof payload[field] === 'undefined' || payload[field] === null,
    );

    if (missingField) {
      this.logger.warn(`Invalid JWT payload: missing ${missingField}`);
      throw new UnauthorizedException('Invalid JWT payload');
    }

    if (typeof payload.sub !== 'string' || typeof payload.email !== 'string') {
      this.logger.warn('Invalid JWT payload types');
      throw new UnauthorizedException('Invalid JWT payload format');
    }

    if (payload.type !== 'access') {
      this.logger.warn('Invalid JWT token type');
      throw new UnauthorizedException('Invalid token type');
    }

    return { id: payload.sub, email: payload.email };
  }
}
