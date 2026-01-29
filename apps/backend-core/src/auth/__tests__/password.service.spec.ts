import { BadRequestException } from '@nestjs/common';
import { PasswordService } from '../services/password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('hashes and validates a strong password', async () => {
    const password = 'Secure123Password';
    const hash = await service.hashPassword(password);
    expect(typeof hash).toBe('string');
    expect(await service.validatePassword(password, hash)).toBe(true);
  });

  it('rejects short passwords', async () => {
    await expect(service.hashPassword('shortA1')).rejects.toThrow(BadRequestException);
  });

  it('rejects passwords without required characters', async () => {
    await expect(service.hashPassword('alllowercase123')).rejects.toThrow(BadRequestException);
  });

  it('uses fallback hash when no stored hash is provided', async () => {
    const result = await service.validatePasswordWithFallback('Secure123Password');
    expect(result).toBe(false);
  });
});
