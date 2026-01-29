import { GrantsController } from '../grants.controller';
import { GrantsService } from '../grants.service';
import { GrantEntity } from '../../database/entities/grant.entity';
import { GrantStatus } from '../../common/enums/grant-status.enum';

const baseGrant: GrantEntity = {
  id: '11111111-1111-1111-1111-111111111111',
  title: 'Grant 1',
  description: 'Description',
  amount: 1000,
  deadline: null,
  officialUrl: null,
  region: 'ES',
  status: GrantStatus.OPEN,
  sectors: null,
  beneficiaries: null,
  sourceId: null,
  source: null as any,
  createdAt: new Date(),
};

describe('GrantsController', () => {
  it('returns paginated grants', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([baseGrant]),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as GrantsService;

    const controller = new GrantsController(service);
    const result = await controller.findAll({ region: 'ES', skip: 0, take: 10 } as any);

    expect(service.findAll).toHaveBeenCalledWith({ region: 'ES' }, { skip: 0, take: 10 });
    expect(result.data).toHaveLength(1);
  });

  it('returns grant by id', async () => {
    const service = {
      findAll: jest.fn(),
      findById: jest.fn().mockResolvedValue(baseGrant),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as GrantsService;

    const controller = new GrantsController(service);
    const result = await controller.findOne(baseGrant.id);

    expect(service.findById).toHaveBeenCalledWith(baseGrant.id);
    expect(result.id).toBe(baseGrant.id);
  });
});
