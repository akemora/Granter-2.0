import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserProfileEntity } from '../database/entities/user-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(UserProfileEntity)
    private readonly profileRepository: Repository<UserProfileEntity>,
  ) {}

  async getProfile(userId: string): Promise<UserProfileEntity> {
    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = await this.createDefaultProfile(userId);
    }
    return profile;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserProfileEntity> {
    const existing = await this.getProfile(userId);
    const merged = this.mergeProfile(existing, dto);

    const entity = this.profileRepository.create(merged);
    await this.profileRepository.save(entity);

    return entity;
  }

  private async createDefaultProfile(userId: string): Promise<UserProfileEntity> {
    const entity = this.profileRepository.create({
      userId,
      keywords: [],
      regions: [],
      emailNotifications: false,
      telegramNotifications: false,
      minAmount: null,
      maxAmount: null,
      email: null,
      telegramChatId: null,
    });
    return this.profileRepository.save(entity);
  }

  private mergeProfile(base: UserProfileEntity, dto: UpdateProfileDto): UserProfileEntity {
    return {
      ...base,
      keywords: dto.keywords ?? base.keywords,
      regions: dto.regions ?? base.regions,
      minAmount: dto.minAmount ?? base.minAmount ?? null,
      maxAmount: dto.maxAmount ?? base.maxAmount ?? null,
      emailNotifications: dto.emailNotifications ?? base.emailNotifications,
      telegramNotifications: dto.telegramNotifications ?? base.telegramNotifications,
      email: dto.email ?? base.email ?? null,
      telegramChatId: dto.telegramChatId ?? base.telegramChatId ?? null,
    };
  }
}
