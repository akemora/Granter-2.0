import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SourceEntity } from '../database/entities/source.entity';
import { CreateSourceDto } from './dto/create-source.dto';
import { UpdateSourceDto } from './dto/update-source.dto';
import { SourceType } from '../common/enums/source-type.enum';

interface SourceFilters {
  active?: boolean;
  region?: string;
}

@Injectable()
export class SourcesService {
  private readonly logger = new Logger(SourcesService.name);

  constructor(
    @InjectRepository(SourceEntity)
    private readonly sourcesRepository: Repository<SourceEntity>,
  ) {}

  async create(dto: CreateSourceDto): Promise<SourceEntity> {
    const source = this.sourcesRepository.create({
      name: dto.name.trim(),
      url: dto.baseUrl.trim(),
      type: dto.type ?? SourceType.HTML,
      region: dto.region ?? 'ES',
      active: dto.isActive ?? true,
      metadata: dto.metadata ?? null,
    });

    try {
      const saved = await this.sourcesRepository.save(source);
      this.logger.log(`Source created: ${saved.id}`);
      return saved;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Source URL already exists');
      }
      throw new BadRequestException(`Failed to create source: ${error.message}`);
    }
  }

  async findAll(filters?: SourceFilters): Promise<SourceEntity[]> {
    const where: SourceFilters = {};
    if (filters?.active !== undefined) {
      where.active = filters.active;
    }
    if (filters?.region) {
      where.region = filters.region;
    }

    return this.sourcesRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<SourceEntity[]> {
    return this.findAll({ active: true });
  }

  async findById(id: string): Promise<SourceEntity> {
    const source = await this.sourcesRepository.findOne({ where: { id } });
    if (!source) {
      throw new NotFoundException('Source not found');
    }
    return source;
  }

  async update(id: string, dto: UpdateSourceDto): Promise<SourceEntity> {
    const source = await this.findById(id);

    const updateData: Partial<SourceEntity> = {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.baseUrl !== undefined && { url: dto.baseUrl.trim() }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.region !== undefined && { region: dto.region }),
      ...(dto.isActive !== undefined && { active: dto.isActive }),
      ...(dto.metadata !== undefined && { metadata: dto.metadata ?? null }),
    };

    try {
      await this.sourcesRepository.update(source.id, updateData);
      return await this.findById(source.id);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Source URL already exists');
      }
      throw new BadRequestException(`Failed to update source: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const source = await this.findById(id);
    await this.sourcesRepository.delete(source.id);
  }

  async markLastRun(id: string): Promise<void> {
    await this.sourcesRepository.update(id, { lastRun: new Date() });
  }
}
