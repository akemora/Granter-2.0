import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';
import { GrantEntity } from '../database/entities/grant.entity';
import { CreateGrantDto } from './dto/create-grant.dto';
import { UpdateGrantDto } from './dto/update-grant.dto';
import { GrantStatus } from '../common/enums/grant-status.enum';

interface FindAllFilters {
  region?: string;
  sector?: string;
  status?: GrantStatus;
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

  private validateGrantId(id: string): void {
    if (!id || typeof id !== 'string' || !isUUID(id)) {
      throw new BadRequestException('Invalid grant ID');
    }
  }

  private normalizeStringArray(values?: string[]): string[] | null {
    if (!values) {
      return null;
    }
    const normalized = values.map((value) => value.trim()).filter(Boolean);
    return normalized.length > 0 ? normalized : null;
  }

  async create(dto: CreateGrantDto): Promise<GrantEntity> {
    try {
      if (!dto.sourceId) {
        throw new BadRequestException('Source ID is required');
      }

      const normalizedAmount = dto.amount !== undefined && dto.amount !== null ? Number(dto.amount) : null;
      if (normalizedAmount !== null && normalizedAmount <= 0) {
        throw new BadRequestException('Grant amount must be greater than 0');
      }

      const normalizedDeadline = dto.deadline ? new Date(dto.deadline) : null;

      const grant = this.grantsRepository.create({
        title: dto.title,
        description: dto.description,
        amount: normalizedAmount,
        deadline: normalizedDeadline,
        region: dto.region,
        officialUrl: dto.officialUrl ?? null,
        status: dto.status ?? GrantStatus.OPEN,
        sectors: this.normalizeStringArray(dto.sectors),
        beneficiaries: this.normalizeStringArray(dto.beneficiaries),
        source: { id: dto.sourceId },
        sourceId: dto.sourceId,
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
        throw new BadRequestException('Referenced source does not exist');
      }
      if (error.code === '23514') {
        throw new BadRequestException('Grant amount must be greater than 0');
      }
      throw new BadRequestException(`Failed to create grant: ${error.message}`);
    }
  }

  async findById(id: string): Promise<GrantEntity> {
    this.validateGrantId(id);

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

  async findAll(filters?: FindAllFilters, pagination?: PaginationParams): Promise<GrantEntity[]> {
    const skip = pagination?.skip ?? 0;
    let take = pagination?.take ?? 10;

    if (take > MAX_ITEMS_PER_PAGE) {
      this.logger.warn(`Requested take: ${take} exceeds max ${MAX_ITEMS_PER_PAGE}, capping to max`);
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
      queryBuilder.andWhere("string_to_array(grant.sectors, ',') && ARRAY[:...sectors]::text[]", {
        sectors: [filters.sector],
      });
    }

    const grants = await queryBuilder.skip(skip).take(take).orderBy('grant.createdAt', 'DESC').getMany();

    this.logger.log(`Retrieved ${grants.length} grants with filters: ${JSON.stringify(filters)}`);
    return grants;
  }

  async update(id: string, dto: UpdateGrantDto): Promise<GrantEntity> {
    this.validateGrantId(id);

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
      updateData.deadline = dto.deadline ? new Date(dto.deadline) : null;
    }

    if (dto.region !== undefined) {
      updateData.region = dto.region;
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.sectors !== undefined) {
      updateData.sectors = this.normalizeStringArray(dto.sectors);
    }

    if (dto.beneficiaries !== undefined) {
      updateData.beneficiaries = this.normalizeStringArray(dto.beneficiaries);
    }

    if (dto.officialUrl !== undefined) {
      updateData.officialUrl = dto.officialUrl ?? null;
    }

    if (dto.sourceId !== undefined && dto.sourceId !== grant.source?.id) {
      updateData.source = dto.sourceId ? ({ id: dto.sourceId } as GrantEntity['source']) : null;
      updateData.sourceId = dto.sourceId ?? null;
    }

    try {
      await this.grantsRepository.update(id, updateData);
      const updatedGrant = await this.findById(id);
      this.logger.log(`Grant updated successfully with ID: ${id}`);
      return updatedGrant;
    } catch (error) {
      this.logger.error(`Error updating grant ${id}: ${error.message}`, error.stack);
      if (error.code === '23503') {
        throw new BadRequestException('Referenced source does not exist');
      }
      if (error.code === '23514') {
        throw new BadRequestException('Grant amount must be greater than 0');
      }
      throw new BadRequestException(`Failed to update grant: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    this.validateGrantId(id);

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
