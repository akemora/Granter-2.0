import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth.service';
import { UserEntity } from '../../database/entities/user.entity';
import { RefreshTokenEntity } from '../../database/entities/refresh-token.entity';
import { PasswordService } from '../services/password.service';
import { JwtService } from '@nestjs/jwt';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: jest.Mocked<Repository<UserEntity>>;
  let refreshTokenRepo: jest.Mocked<Repository<RefreshTokenEntity>>;
  let jwtService: { signAsync: jest.Mock };
  let passwordService: { hashPassword: jest.Mock; validatePasswordWithFallback: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    refreshTokenRepo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    } as any;

    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    } as any;

    passwordService = {
      hashPassword: jest.fn(),
      validatePasswordWithFallback: jest.fn(),
    };

    type MockManager = { getRepository: jest.Mock };
    const manager: MockManager = {
      getRepository: jest.fn().mockReturnValue(refreshTokenRepo),
    };
    (refreshTokenRepo as any).manager = {
      transaction: jest.fn(async (callback: (manager: MockManager) => Promise<unknown>) => callback(manager)),
    };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-token');
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(RefreshTokenEntity), useValue: refreshTokenRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: PasswordService, useValue: passwordService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('registers a user without issuing tokens', async () => {
    passwordService.hashPassword.mockResolvedValue('hashed-password');
    userRepo.create.mockImplementation((data) => ({ id: 'user-1', ...data }) as UserEntity);
    userRepo.save.mockResolvedValue({ id: 'user-1', email: 'test@test.com' } as UserEntity);

    await service.register({ email: 'test@test.com', password: 'Pass123!' });

    expect(jwtService.signAsync).not.toHaveBeenCalled();
    expect(refreshTokenRepo.save).not.toHaveBeenCalled();
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('allows duplicate registration email without error', async () => {
    passwordService.hashPassword.mockResolvedValue('hashed-password');
    userRepo.create.mockImplementation((data) => ({ id: 'user-1', ...data }) as UserEntity);
    userRepo.save.mockRejectedValue({ code: '23505' });

    await expect(service.register({ email: 'dup@test.com', password: 'Pass123!' })).resolves.toBeUndefined();
    expect(userRepo.save).toHaveBeenCalled();
  });

  it('logs in with valid credentials', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'user@test.com', passwordHash: 'hash' } as UserEntity);
    passwordService.validatePasswordWithFallback.mockResolvedValue(true);
    jwtService.signAsync.mockResolvedValueOnce('access-token').mockResolvedValueOnce('refresh-token');
    refreshTokenRepo.findOne.mockResolvedValue(null);
    refreshTokenRepo.create.mockImplementation((data) => data as RefreshTokenEntity);
    refreshTokenRepo.save.mockResolvedValue({} as RefreshTokenEntity);

    const result = await service.login({ email: 'user@test.com', password: 'Pass123!' });

    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.tokens.refreshToken).toBe('refresh-token');
  });

  it('rejects invalid password on login', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'user@test.com', passwordHash: 'hash' } as UserEntity);
    passwordService.validatePasswordWithFallback.mockResolvedValue(false);

    await expect(service.login({ email: 'user@test.com', password: 'WrongPass!' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('rejects refresh when token type is invalid', async () => {
    (jwtService as any).verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'access' });

    await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
  });

  it('rejects refresh when token is missing jti', async () => {
    (jwtService as any).verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh' });

    await expect(service.refresh('bad-token')).rejects.toThrow(UnauthorizedException);
    expect(userRepo.findOne).not.toHaveBeenCalled();
  });

  it('rejects refresh when user does not exist', async () => {
    (jwtService as any).verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh', jti: 'token-1' });
    userRepo.findOne.mockResolvedValue(null);

    await expect(service.refresh('refresh-token')).rejects.toThrow(UnauthorizedException);
  });

  it('rejects refresh when token is expired', async () => {
    (jwtService as any).verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh', jti: 'token-1' });
    userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'user@test.com' } as UserEntity);
    refreshTokenRepo.findOne.mockResolvedValue({
      userId: 'user-1',
      tokenId: 'token-1',
      tokenHash: 'hashed-token',
      expiresAt: new Date(Date.now() - 60_000),
      revokedAt: null,
    } as RefreshTokenEntity);

    await expect(service.refresh('refresh-token')).rejects.toThrow(UnauthorizedException);
  });

  it('issues new tokens on valid refresh', async () => {
    (jwtService as any).verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh', jti: 'token-1' });
    userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'user@test.com' } as UserEntity);
    refreshTokenRepo.findOne.mockResolvedValue({
      userId: 'user-1',
      tokenId: 'token-1',
      tokenHash: 'hashed-token',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    } as RefreshTokenEntity);

    jwtService.signAsync.mockResolvedValueOnce('new-access-token').mockResolvedValueOnce('new-refresh-token');
    refreshTokenRepo.save.mockResolvedValue({} as RefreshTokenEntity);

    const result = await service.refresh('refresh-token');

    expect(result.tokens.accessToken).toBe('new-access-token');
    expect(result.tokens.refreshToken).toBe('new-refresh-token');
  });

  it('revokes refresh token on invalid hash', async () => {
    (jwtService as any).verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh', jti: 'token-1' });
    userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'user@test.com' } as UserEntity);
    refreshTokenRepo.findOne.mockResolvedValue({
      userId: 'user-1',
      tokenId: 'token-1',
      tokenHash: 'hashed-token',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: null,
    } as RefreshTokenEntity);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(service.refresh('refresh-token')).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepo.update).toHaveBeenCalledWith(
      { userId: 'user-1' },
      { revokedAt: expect.any(Date) },
    );
  });

  it('revokes all tokens when refresh token is already revoked', async () => {
    (jwtService as any).verifyAsync.mockResolvedValue({ sub: 'user-1', type: 'refresh', jti: 'token-1' });
    userRepo.findOne.mockResolvedValue({ id: 'user-1', email: 'user@test.com' } as UserEntity);
    refreshTokenRepo.findOne.mockResolvedValue({
      userId: 'user-1',
      tokenId: 'token-1',
      tokenHash: 'hashed-token',
      expiresAt: new Date(Date.now() + 60_000),
      revokedAt: new Date(),
    } as RefreshTokenEntity);

    await expect(service.refresh('refresh-token')).rejects.toThrow(UnauthorizedException);
    expect(refreshTokenRepo.update).toHaveBeenCalledWith(
      { userId: 'user-1' },
      { revokedAt: expect.any(Date) },
    );
  });
});
