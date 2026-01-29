import { Body, Controller, Get, Put, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserProfileEntity } from '../database/entities/user-profile.entity';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Request() req: { user: { id: string } }): Promise<UserProfileEntity> {
    return this.profileService.getProfile(req.user.id);
  }

  @Put()
  async updateProfile(
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateProfileDto,
  ): Promise<UserProfileEntity> {
    return this.profileService.updateProfile(req.user.id, dto);
  }
}
