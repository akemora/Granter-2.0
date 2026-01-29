import { Body, Controller, Get, HttpCode, Logger, Post, Request, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { AuthLoginDto } from './dto/login.dto';
import { AuthRegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL,
  CSRF_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_DAYS,
} from './auth.constants';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(201)
  async register(
    @Body() body: AuthRegisterDto,
  ): Promise<{ message: string }> {
    await this.authService.register(body);
    return { message: 'Si el correo es válido, ya puedes iniciar sesión.' };
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 300 } })
  @HttpCode(200)
  async login(
    @Body() body: AuthLoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ id: string; email: string }> {
    const result = await this.authService.login(body);
    this.setAuthCookies(res, result.tokens);
    return result.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(@Request() req: { user: { id: string; email: string } }): Promise<{ id: string; email: string }> {
    return this.authService.getCurrentUser(req.user.id);
  }

  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Request() req: { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ id: string; email: string }> {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    const result = await this.authService.refresh(refreshToken);
    this.setAuthCookies(res, result.tokens);
    return result.user;
  }

  @Post('logout')
  @HttpCode(204)
  async logout(
    @Request() req: { cookies?: Record<string, string> },
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (refreshToken) {
      try {
        await this.authService.revokeRefreshToken(refreshToken);
      } catch (error) {
        this.logger.error('Failed to revoke refresh token', error);
      }
    }
    this.clearAuthCookies(res);
  }

  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProduction = process.env.NODE_ENV === 'production';
    const accessMaxAge = this.parseAccessTokenTtl();
    const refreshMaxAge = REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;
    const csrfToken = this.generateCsrfToken();

    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: accessMaxAge,
      path: '/',
    });

    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: refreshMaxAge,
      path: '/',
    });

    res.cookie(CSRF_COOKIE, csrfToken, {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: refreshMaxAge,
      path: '/',
    });
  }

  private clearAuthCookies(res: Response) {
    const isProduction = process.env.NODE_ENV === 'production';
    const options = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 0,
    } as const;

    res.cookie(ACCESS_TOKEN_COOKIE, '', options);
    res.cookie(REFRESH_TOKEN_COOKIE, '', options);
    res.cookie(CSRF_COOKIE, '', {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
      maxAge: 0,
    });
  }

  private generateCsrfToken(): string {
    return randomBytes(32).toString('hex');
  }

  private parseAccessTokenTtl(): number {
    if (ACCESS_TOKEN_TTL.endsWith('m')) {
      return Number(ACCESS_TOKEN_TTL.replace('m', '')) * 60 * 1000;
    }
    if (ACCESS_TOKEN_TTL.endsWith('h')) {
      return Number(ACCESS_TOKEN_TTL.replace('h', '')) * 60 * 60 * 1000;
    }
    return 15 * 60 * 1000;
  }
}
