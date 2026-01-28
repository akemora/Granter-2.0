import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrantEntity } from '../database/entities/grant.entity';
import { CreateGrantDto } from './dto/create-grant.dto';
import { UpdateGrantDto } from './dto/update-grant.dto';

interface FindAllFilters {
  region?: string;
  sector?: string;
  status?: string;
}

interface PaginationParams {
  skip: number;
  take: number;
}

const MAX_ITEMS_PER_PAGE = 100;

@Injectable()
export class GrantsService {
  private readonly logger = new Logger(GrantsService.name);

  constructor(
    @InjectRepository(GrantEntity)
    private readonly grantsRepository: Repository<GrantEntity>,
  ) {}

  async create(dto: CreateGrantDto): Promise<GrantEntity> {
    try {
      if (!dto.sourceId) {
        throw new BadRequestException('Source ID is required');
      }

      const grant = this.grantsRepository.create({
        title: dto.title,
        description: dto.description,
        amount: dto.amount,
        deadline: new Date(dto.deadline),
        region: dto.region,
        source: { id: dto.sourceId },
      });

      const savedGrant = await this.grantsRepository.save(grant);
      this.logger.log(`Grant created successfully with ID: ${savedGrant.id}`);
      return savedGrant;
    } catch (error) {
      this.logger.error(`Error creating grant: ${error.message}`, error.stack);
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error.code === '23503') {
        throw new ConflictException('Referenced source does not exist');
      }
      if (error.code === '23514') {
        throw new BadRequestException('Grant amount must be greater than 0');
      }
      throw new BadRequestException(`Failed to create grant: ${error.message}`);
    }
  }

  async findById(id: string): Promise<GrantEntity> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid grant ID');
    }

    const grant = await this.grantsRepository.findOne({
      where: { id },
      relations: ['source'],
    });

    if (!grant) {
      this.logger.warn(`Grant not found with ID: ${id}`);
      throw new NotFoundException('Grant not found');
    }

    return grant;
  }

  async findAll(
    filters?: FindAllFilters,
    pagination?: PaginationParams,
  ): Promise<GrantEntity[]> {
    const skip = pagination?.skip ?? 0;
    let take = pagination?.take ?? 10;

    if (take > MAX_ITEMS_PER_PAGE) {
      this.logger.warn(
        `Requested take: ${take} exceeds max ${MAX_ITEMS_PER_PAGE}, capping to max`,
      );
      take = MAX_ITEMS_PER_PAGE;
    }

    if (skip < 0) {
      throw new BadRequestException('Skip parameter cannot be negative');
    }

    if (take <= 0) {
      throw new BadRequestException('Take parameter must be greater than 0');
    }

    const queryBuilder = this.grantsRepository.createQueryBuilder('grant');
    queryBuilder.leftJoinAndSelect('grant.source', 'source');

    if (filters?.region) {
      queryBuilder.andWhere('grant.region = :region', { region: filters.region });
    }

    if (filters?.status) {
      queryBuilder.andWhere('grant.status = :status', { status: filters.status });
    }

    if (filters?.sector) {
      queryBuilder.andWhere('source.sector = :sector', {
        sector: filters.sector,
      });
    }

    const grants = await queryBuilder
      .skip(skip)
      .take(take)
      .orderBy('grant.created_at', 'DESC')
      .getMany();

    this.logger.log(
      `Retrieved ${grants.length} grants with filters: ${JSON.stringify(filters)}`,
    );
    return grants;
  }

  async update(id: string, dto: UpdateGrantDto): Promise<GrantEntity> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid grant ID');
    }

    const grant = await this.findById(id);

    const updateData: Partial<GrantEntity> = {};

    if (dto.title !== undefined) {
      updateData.title = dto.title;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.amount !== undefined) {
      if (dto.amount <= 0) {
        throw new BadRequestException('Grant amount must be greater than 0');
      }
      updateData.amount = dto.amount;
    }

    if (dto.deadline !== undefined) {
      updateData.deadline = new Date(dto.deadline);
    }

    if (dto.region !== undefined) {
      updateData.region = dto.region;
    }

    if (dto.sourceId !== undefined && dto.sourceId !== grant.source.id) {
      updateData.source = { id: dto.sourceId } as any;
    }

    try {
      await this.grantsRepository.update(id, updateData);
      const updatedGrant = await this.findById(id);
      this.logger.log(`Grant updated successfully with ID: ${id}`);
      return updatedGrant;
    } catch (error) {
      this.logger.error(`Error updating grant ${id}: ${error.message}`, error.stack);
      if (error.code === '23503') {
        throw new ConflictException('Referenced source does not exist');
      }
      if (error.code === '23514') {
        throw new BadRequestException('Grant amount must be greater than 0');
      }
      throw new BadRequestException(`Failed to update grant: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid grant ID');
    }

    const grant = await this.findById(id);

    try {
      const result = await this.grantsRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('Grant not found');
      }

      this.logger.log(`Grant deleted successfully with ID: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting grant ${id}: ${error.message}`, error.stack);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete grant: ${error.message}`);
    }
  }
}
