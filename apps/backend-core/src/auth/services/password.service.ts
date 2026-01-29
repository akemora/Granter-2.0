import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN } from '../auth.constants';

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private static readonly SALT_ROUNDS = 12;
  private fallbackHashPromise?: Promise<string>;

  async hashPassword(password: string): Promise<string> {
    this.validatePasswordStrength(password);
    return bcrypt.hash(password, PasswordService.SALT_ROUNDS);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async validatePasswordWithFallback(password: string, hash?: string | null): Promise<boolean> {
    const targetHash = hash ?? (await this.getFallbackHash());
    return bcrypt.compare(password, targetHash);
  }

  private validatePasswordStrength(password: string) {
    if (!password) {
      this.logger.warn('Password is empty');
      throw new BadRequestException('Password is required');
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      this.logger.warn('Password too short');
      throw new BadRequestException(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
    }

    if (!PASSWORD_PATTERN.test(password)) {
      this.logger.warn('Password missing required character classes');
      throw new BadRequestException('Password must include uppercase, lowercase, and numeric characters');
    }
  }

  private getFallbackHash(): Promise<string> {
    if (!this.fallbackHashPromise) {
      this.fallbackHashPromise = bcrypt.hash('FallbackPassword123', PasswordService.SALT_ROUNDS);
    }
    return this.fallbackHashPromise;
  }
}
