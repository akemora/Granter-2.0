import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GrantsService } from '../grants.service';
import { GrantEntity } from '../../database/entities/grant.entity';
import { GrantStatus } from '../../common/enums/grant-status.enum';
import { GrantRegion } from '../dto/grant-region.enum';

const baseGrant: GrantEntity = {
  id: '11111111-1111-4111-8111-111111111111',
  title: 'Grant 1',
  description: 'Description',
  amount: 1000,
  deadline: null,
  officialUrl: null,
  region: 'ES',
  status: GrantStatus.OPEN,
  sectors: null,
  beneficiaries: null,
  sourceId: '22222222-2222-4222-8222-222222222222',
  source: null as any,
  createdAt: new Date(),
};

describe('GrantsService', () => {
  let service: GrantsService;
  let repository: jest.Mocked<Repository<GrantEntity>>;

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrantsService,
        {
          provide: getRepositoryToken(GrantEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<GrantsService>(GrantsService);
  });

  it('creates a grant', async () => {
    repository.create.mockReturnValue(baseGrant);
    repository.save.mockResolvedValue(baseGrant);

    const result = await service.create({
      title: 'Grant 1',
      description: 'Description',
      amount: 1000,
      deadline: null,
      region: GrantRegion.ES,
      officialUrl: null,
      status: GrantStatus.OPEN,
      sectors: ['tech'],
      beneficiaries: ['ngo'],
      sourceId: baseGrant.sourceId!,
    });

    expect(result).toEqual(baseGrant);
    expect(repository.save).toHaveBeenCalled();
  });

  it('rejects create when sourceId is missing', async () => {
    await expect(
      service.create({
        title: 'Grant 1',
        description: 'Description',
        amount: 1000,
        deadline: null,
        region: GrantRegion.ES,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects create when amount is invalid', async () => {
    await expect(
      service.create({
        title: 'Grant 1',
        description: 'Description',
        amount: 0,
        deadline: null,
        region: GrantRegion.ES,
        sourceId: baseGrant.sourceId!,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('maps foreign key error on create', async () => {
    repository.create.mockReturnValue(baseGrant);
    repository.save.mockRejectedValue({ code: '23503' });

    await expect(
      service.create({
        title: 'Grant 1',
        description: 'Description',
        amount: 1000,
        deadline: null,
        region: GrantRegion.ES,
        sourceId: baseGrant.sourceId!,
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('finds grant by id', async () => {
    repository.findOne.mockResolvedValue(baseGrant);

    const result = await service.findById(baseGrant.id);

    expect(result).toEqual(baseGrant);
  });

  it('throws for invalid grant id', async () => {
    await expect(service.findById('bad-id')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found for missing grant', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findById(baseGrant.id)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('finds all grants with filters and pagination', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([baseGrant]),
    };
    repository.createQueryBuilder.mockReturnValue(qb as any);

    const result = await service.findAll(
      { region: 'ES', status: GrantStatus.OPEN, sector: 'tech' },
      { skip: 0, take: 10 },
    );

    expect(result).toHaveLength(1);
    expect(qb.andWhere).toHaveBeenCalledWith('grant.region = :region', { region: 'ES' });
    expect(qb.andWhere).toHaveBeenCalledWith('grant.status = :status', { status: GrantStatus.OPEN });
    expect(qb.andWhere).toHaveBeenCalledWith("string_to_array(grant.sectors, ',') && ARRAY[:...sectors]::text[]", {
      sectors: ['tech'],
    });
    expect(qb.skip).toHaveBeenCalledWith(0);
    expect(qb.take).toHaveBeenCalledWith(10);
  });

  it('caps take to max and validates pagination params', async () => {
    const qb = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([baseGrant]),
    };
    repository.createQueryBuilder.mockReturnValue(qb as any);

    await service.findAll({}, { skip: 0, take: 1000 });

    expect(qb.take).toHaveBeenCalledWith(100);

    await expect(service.findAll({}, { skip: -1, take: 10 })).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.findAll({}, { skip: 0, take: 0 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('updates a grant', async () => {
    repository.findOne
      .mockResolvedValueOnce({ ...baseGrant })
      .mockResolvedValueOnce({ ...baseGrant, title: 'Updated' });
    repository.update.mockResolvedValue({} as any);

    const result = await service.update(baseGrant.id, {
      title: 'Updated',
      amount: 2000,
      officialUrl: 'https://example.com',
    });

    expect(repository.update).toHaveBeenCalled();
    expect(result.title).toBe('Updated');
  });

  it('rejects update when amount is invalid', async () => {
    repository.findOne.mockResolvedValue(baseGrant);

    await expect(service.update(baseGrant.id, { amount: 0 })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('deletes a grant', async () => {
    repository.delete.mockResolvedValue({ affected: 1 } as any);

    await expect(service.delete(baseGrant.id)).resolves.toBeUndefined();
  });

  it('throws when deleting missing grant', async () => {
    repository.delete.mockResolvedValue({ affected: 0 } as any);

    await expect(service.delete(baseGrant.id)).rejects.toBeInstanceOf(NotFoundException);
  });
});
