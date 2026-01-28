import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { Request } from "express";
import { timingSafeEqual } from "crypto";

@Injectable()
export class XServiceTokenGuard implements CanActivate {
  private readonly logger = new Logger(XServiceTokenGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const header = request.header("x-service-token");
    const token = process.env.SERVICE_TOKEN;

    if (!token) {
      this.logger.error("SERVICE_TOKEN is not configured");
      throw new ForbiddenException("Invalid service token");
    }

    if (!header) {
      this.logger.warn("Missing X-Service-Token header");
      throw new ForbiddenException("Invalid service token");
    }

    const isValid = this.compareTokens(header, token);
    if (!isValid) {
      this.logger.warn("Invalid X-Service-Token provided");
      throw new ForbiddenException("Invalid service token");
    }

    return true;
  }

  private compareTokens(received: string, expected: string): boolean {
    try {
      const receivedBuffer = Buffer.from(received, "utf8");
      const expectedBuffer = Buffer.from(expected, "utf8");

      if (receivedBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return timingSafeEqual(receivedBuffer, expectedBuffer);
    } catch (error) {
      this.logger.error("Token comparison failed", error as Error);
      return false;
    }
  }
}
