import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CSRF_COOKIE, CSRF_HEADER, ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../../auth/auth.constants';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (SAFE_METHODS.has(request.method)) {
      return true;
    }

    const path = request.path ?? request.originalUrl ?? '';
    if (this.isAuthBootstrapRoute(path)) {
      return true;
    }

    if (this.hasServiceToken(request)) {
      return true;
    }

    if (!this.hasAuthCookie(request)) {
      return true;
    }

    const csrfCookie = request.cookies?.[CSRF_COOKIE];
    const csrfHeader = request.headers[CSRF_HEADER] as string | undefined;

    if (!csrfCookie || !csrfHeader) {
      throw new ForbiddenException('Missing CSRF token');
    }

    if (csrfCookie !== csrfHeader) {
      throw new ForbiddenException('Invalid CSRF token');
    }

    return true;
  }

  private isAuthBootstrapRoute(path: string): boolean {
    return /^\/auth\/(login|register)$/.test(path);
  }

  private hasServiceToken(request: Request): boolean {
    const headers = request.headers ?? {};
    return Boolean(headers['x-service-token']);
  }

  private hasAuthCookie(request: Request): boolean {
    return Boolean(request.cookies?.[ACCESS_TOKEN_COOKIE] || request.cookies?.[REFRESH_TOKEN_COOKIE]);
  }
}
