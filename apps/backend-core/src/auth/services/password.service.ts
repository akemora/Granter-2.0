import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import * as bcrypt from "bcrypt";

@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);
  private static readonly MIN_LENGTH = 12;
  private static readonly PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  private static readonly SALT_ROUNDS = 12;

  async hashPassword(password: string): Promise<string> {
    this.validatePasswordStrength(password);
    return bcrypt.hash(password, PasswordService.SALT_ROUNDS);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  private validatePasswordStrength(password: string) {
    if (!password) {
      this.logger.warn("Password is empty");
      throw new BadRequestException("Password is required");
    }

    if (password.length < PasswordService.MIN_LENGTH) {
      this.logger.warn("Password too short");
      throw new BadRequestException(
        `Password must be at least ${PasswordService.MIN_LENGTH} characters`,
      );
    }

    if (!PasswordService.PASSWORD_REGEX.test(password)) {
      this.logger.warn("Password missing required character classes");
      throw new BadRequestException(
        "Password must include uppercase, lowercase, and numeric characters",
      );
    }
  }
}
