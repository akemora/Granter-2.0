import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PasswordService } from './services/password.service';
import { UserEntity } from '../database/entities/user.entity';
import { AuthRegisterDto } from './dto/register.dto';
import { AuthLoginDto } from './dto/login.dto';
import { RefreshTokenEntity } from '../database/entities/refresh-token.entity';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL_DAYS } from './auth.constants';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthResult = {
  user: { id: string; email: string };
  tokens: AuthTokens;
};

type RefreshTokenPayload = {
  sub: string;
  type?: string;
  jti?: string;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokenRepo: Repository<RefreshTokenEntity>,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(dto: AuthRegisterDto): Promise<void> {
    const hash = await this.passwordService.hashPassword(dto.password);
    const user = this.userRepo.create({ email: dto.email, passwordHash: hash });
    try {
      await this.userRepo.save(user);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        return;
      }
      throw error;
    }
  }

  async login(dto: AuthLoginDto): Promise<AuthResult> {
    const user = await this.validateUser(dto.email, dto.password);
    const tokens = await this.issueTokens(user);
    return { user: { id: user.id, email: user.email }, tokens };
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { email } });
    const isValid = await this.passwordService.validatePasswordWithFallback(password, user?.passwordHash);
    if (!user || !isValid) {
      this.logger.warn('Invalid login attempt');
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async refresh(refreshToken: string): Promise<AuthResult> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.userRepo.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.rotateRefreshToken(user, refreshToken, payload.jti);
    return { user: { id: user.id, email: user.email }, tokens };
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const record = await this.refreshTokenRepo.findOne({ where: { userId: payload.sub } });
    if (!record) {
      return;
    }
    record.revokedAt = new Date();
    await this.refreshTokenRepo.save(record);
  }

  async getCurrentUser(userId: string): Promise<{ id: string; email: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { id: user.id, email: user.email };
  }

  private async issueTokens(user: UserEntity, repo: Repository<RefreshTokenEntity> = this.refreshTokenRepo): Promise<AuthTokens> {
    const tokenId = randomUUID();
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.signRefreshToken(user, tokenId);
    await this.storeRefreshToken(repo, user.id, refreshToken, tokenId, this.getRefreshExpiry());
    return { accessToken, refreshToken };
  }

  private async signAccessToken(user: UserEntity): Promise<string> {
    const payload = { sub: user.id, email: user.email, type: 'access' as const };
    return this.jwtService.signAsync(payload, { expiresIn: ACCESS_TOKEN_TTL });
  }

  private async signRefreshToken(user: UserEntity, tokenId: string): Promise<string> {
    const payload = { sub: user.id, email: user.email, type: 'refresh' as const, jti: tokenId };
    const token = await this.jwtService.signAsync(payload, { expiresIn: `${REFRESH_TOKEN_TTL_DAYS}d` });
    return token;
  }

  private async storeRefreshToken(
    repo: Repository<RefreshTokenEntity>,
    userId: string,
    token: string,
    tokenId: string,
    expiresAt: Date,
  ): Promise<void> {
    const tokenHash = await bcrypt.hash(token, 12);
    const existing = await repo.findOne({ where: { userId } });
    if (existing) {
      existing.tokenHash = tokenHash;
      existing.tokenId = tokenId;
      existing.expiresAt = expiresAt;
      existing.revokedAt = null;
      await repo.save(existing);
      return;
    }

    const record = repo.create({ userId, tokenHash, tokenId, expiresAt });
    await repo.save(record);
  }

  private async assertRefreshTokenValid(
    record: RefreshTokenEntity | null,
    token: string,
    tokenId: string,
    repo: Repository<RefreshTokenEntity>,
  ): Promise<void> {
    if (!record || record.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (record.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    if (record.tokenId !== tokenId) {
      await this.revokeRecord(record, repo);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(token, record.tokenHash);
    if (!matches) {
      await this.revokeRecord(record, repo);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async verifyRefreshToken(token: string): Promise<{ sub: string; jti: string }> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token);
      if (payload.type !== 'refresh' || typeof payload.sub !== 'string' || typeof payload.jti !== 'string') {
        throw new UnauthorizedException('Invalid refresh token');
      }
      return { sub: payload.sub, jti: payload.jti };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async rotateRefreshToken(user: UserEntity, refreshToken: string, tokenId: string): Promise<AuthTokens> {
    return this.refreshTokenRepo.manager.transaction(async (manager) => {
      const repo = manager.getRepository(RefreshTokenEntity);
      const record = await repo.findOne({ where: { userId: user.id }, lock: { mode: 'pessimistic_write' } });
      await this.assertRefreshTokenValid(record, refreshToken, tokenId, repo);
      return this.issueTokens(user, repo);
    });
  }

  private async revokeRecord(record: RefreshTokenEntity, repo: Repository<RefreshTokenEntity>): Promise<void> {
    record.revokedAt = new Date();
    await repo.save(record);
  }

  private isUniqueViolation(error: unknown): boolean {
    return typeof (error as { code?: string }).code === 'string' && (error as { code?: string }).code === '23505';
  }

  private getRefreshExpiry(): Date {
    return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);
  }
}
