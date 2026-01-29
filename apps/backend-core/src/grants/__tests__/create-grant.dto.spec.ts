import { validate } from 'class-validator';
import { CreateGrantDto } from '../dto/create-grant.dto';
import { GrantRegion } from '../dto/grant-region.enum';
import { GrantStatus } from '../../common/enums/grant-status.enum';

describe('CreateGrantDto', () => {
  it('validates a complete payload', async () => {
    const dto = new CreateGrantDto();
    dto.title = 'Funding Title';
    dto.description = 'Detailed desc';
    dto.amount = 100;
    dto.deadline = new Date().toISOString();
    dto.region = GrantRegion.ES;
    dto.status = GrantStatus.OPEN;
    dto.sectors = ['research', 'innovation'];
    dto.beneficiaries = ['universities'];
    dto.sourceId = 'source-1';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('rejects negative amount', async () => {
    const dto = new CreateGrantDto();
    dto.title = 'Funding Title';
    dto.description = 'desc';
    dto.amount = -5;
    dto.deadline = new Date().toISOString();
    dto.region = GrantRegion.EU;
    dto.sourceId = 'source-1';

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'amount')).toBe(true);
  });

  it('rejects invalid deadline format', async () => {
    const dto = new CreateGrantDto();
    dto.title = 'Funding Title';
    dto.description = 'desc';
    dto.amount = 10;
    dto.deadline = 'not-a-date';
    dto.region = GrantRegion.INT;
    dto.sourceId = 'source-1';

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'deadline')).toBe(true);
  });

  it('requires amount and deadline', async () => {
    const dto = new CreateGrantDto();
    dto.title = 'Funding Title';
    dto.description = 'desc';
    dto.region = GrantRegion.ES;
    dto.sourceId = 'source-1';

    const errors = await validate(dto);
    const errorFields = errors.map((error) => error.property);
    expect(errorFields).toContain('amount');
    expect(errorFields).toContain('deadline');
  });

  it('rejects invalid status value', async () => {
    const dto = new CreateGrantDto();
    dto.title = 'Funding Title';
    dto.description = 'desc';
    dto.amount = 100;
    dto.deadline = new Date().toISOString();
    dto.region = GrantRegion.ES;
    dto.status = 'invalid' as GrantStatus;
    dto.sourceId = 'source-1';

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'status')).toBe(true);
  });
});
