import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PasswordService } from "./services/password.service";
import { UserEntity } from "../database/entities/user.entity";
import { AuthRegisterDto } from "./dto/register.dto";
import { AuthLoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
  ) {}

  async register(dto: AuthRegisterDto): Promise<{ accessToken: string }> {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) {
      this.logger.warn(
        `Registration blocked: email ${dto.email} already exists`,
      );
      throw new BadRequestException("Email already registered");
    }

    const hash = await this.passwordService.hashPassword(dto.password);
    const user = this.userRepo.create({ email: dto.email, passwordHash: hash });
    await this.userRepo.save(user);
    return { accessToken: await this.signToken(user) };
  }

  async login(dto: AuthLoginDto): Promise<{ accessToken: string }> {
    const user = await this.validateUser(dto.email, dto.password);
    return { accessToken: await this.signToken(user) };
  }

  async validateUser(email: string, password: string): Promise<UserEntity> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      this.logger.warn(`Validation failed: user ${email} not found`);
      throw new UnauthorizedException("Invalid credentials");
    }

    const isValid = await this.passwordService.validatePassword(
      password,
      user.passwordHash,
    );
    if (!isValid) {
      this.logger.warn(`Validation failed: password mismatch for ${email}`);
      throw new UnauthorizedException("Invalid credentials");
    }

    return user;
  }

  async getCurrentUser(userId: string): Promise<{ id: string; email: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return { id: user.id, email: user.email };
  }

  private async signToken(user: UserEntity): Promise<string> {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }
}
