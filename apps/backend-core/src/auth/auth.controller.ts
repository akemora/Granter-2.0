import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthLoginDto } from "./dto/login.dto";
import { AuthRegisterDto } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(201)
  register(@Body() body: AuthRegisterDto): Promise<{ accessToken: string }> {
    return this.authService.register(body);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() body: AuthLoginDto): Promise<{ accessToken: string }> {
    return this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  getCurrentUser(
    @Request() req: { user: { id: string; email: string } },
  ): Promise<{ id: string; email: string }> {
    return this.authService.getCurrentUser(req.user.id);
  }
}
