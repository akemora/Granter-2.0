import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import { SourcesService } from '../sources.service';
import { SourceEntity } from '../../database/entities/source.entity';
import { SourceType } from '../../common/enums/source-type.enum';

describe('SourcesService', () => {
  let service: SourcesService;
  let repository: jest.Mocked<Repository<SourceEntity>>;

  const baseSource: SourceEntity = {
    id: 'source-1',
    name: 'Source A',
    url: 'https://example.com',
    type: SourceType.HTML,
    region: 'ES',
    active: true,
    metadata: null,
    lastRun: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourcesService,
        {
          provide: getRepositoryToken(SourceEntity),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<SourcesService>(SourcesService);
  });

  it('creates a source', async () => {
    repository.create.mockReturnValue(baseSource);
    repository.save.mockResolvedValue(baseSource);

    const result = await service.create({
      name: 'Source A',
      baseUrl: 'https://example.com',
      type: SourceType.HTML,
      region: 'ES',
      isActive: true,
    });

    expect(result).toEqual(baseSource);
    expect(repository.save).toHaveBeenCalled();
  });

  it('throws conflict on duplicate url', async () => {
    repository.create.mockReturnValue(baseSource);
    repository.save.mockRejectedValue({ code: '23505' });

    await expect(
      service.create({
        name: 'Source A',
        baseUrl: 'https://example.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('filters active sources', async () => {
    repository.find.mockResolvedValue([baseSource]);

    const result = await service.findAll({ active: true });

    expect(result).toHaveLength(1);
    expect(repository.find).toHaveBeenCalledWith({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });
  });
});
