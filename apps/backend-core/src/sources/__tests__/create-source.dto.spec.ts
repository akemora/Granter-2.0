import { validate } from 'class-validator';
import { CreateSourceDto } from '../dto/create-source.dto';
import { SourceType } from '../../common/enums/source-type.enum';

describe('CreateSourceDto', () => {
  it('validates a complete payload', async () => {
    const dto = new CreateSourceDto();
    dto.name = 'Boletín Oficial del Estado';
    dto.baseUrl = 'https://www.boe.es/diario_boe/xml.php';
    dto.type = SourceType.HTML;
    dto.region = 'ES';
    dto.isActive = true;

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('rejects invalid url', async () => {
    const dto = new CreateSourceDto();
    dto.name = 'Source';
    dto.baseUrl = 'not-a-url';

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'baseUrl')).toBe(true);
  });

  it('rejects short name', async () => {
    const dto = new CreateSourceDto();
    dto.name = 'A';
    dto.baseUrl = 'https://example.com';

    const errors = await validate(dto);
    expect(errors.some((error) => error.property === 'name')).toBe(true);
  });
});
