import { SourcesController } from '../sources.controller';
import { SourcesService } from '../sources.service';
import { SourceEntity } from '../../database/entities/source.entity';

describe('SourcesController', () => {
  it('passes filters to service', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([{ id: 's1' } as SourceEntity]),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as SourcesService;

    const controller = new SourcesController(service);
    const result = await controller.findAll('true', 'ES');

    expect(service.findAll).toHaveBeenCalledWith({ active: true, region: 'ES' });
    expect(result).toHaveLength(1);
  });

  it('uses undefined for missing active filter', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([]),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as SourcesService;

    const controller = new SourcesController(service);
    await controller.findAll(undefined, undefined);

    expect(service.findAll).toHaveBeenCalledWith({ active: undefined, region: undefined });
  });
});
