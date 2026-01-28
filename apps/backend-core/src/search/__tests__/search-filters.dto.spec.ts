import { validate } from 'class-validator';
import { SearchFiltersDto } from '../dto/search-filters.dto';

describe('SearchFiltersDto', () => {
  it('accepts empty filters (all optional)', async () => {
    const dto = new SearchFiltersDto();
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('accepts full-text search query', async () => {
    const dto = new SearchFiltersDto();
    dto.query = 'research funding';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('accepts single region', async () => {
    const dto = new SearchFiltersDto();
    dto.regions = ['ES'];
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('accepts multiple regions', async () => {
    const dto = new SearchFiltersDto();
    dto.regions = ['ES', 'EU', 'INT'];
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('accepts multiple sectors', async () => {
    const dto = new SearchFiltersDto();
    dto.sectors = ['tech', 'health', 'education'];
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('accepts amount range', async () => {
    const dto = new SearchFiltersDto();
    dto.minAmount = 1000;
    dto.maxAmount = 100000;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('accepts deadline range', async () => {
    const dto = new SearchFiltersDto();
    dto.deadlineAfter = '2024-01-01';
    dto.deadlineBefore = '2024-12-31';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('accepts status filter', async () => {
    const dto = new SearchFiltersDto();
    dto.status = 'active';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('accepts combined filters', async () => {
    const dto = new SearchFiltersDto();
    dto.query = 'research';
    dto.regions = ['ES', 'EU'];
    dto.minAmount = 5000;
    dto.maxAmount = 50000;
    dto.deadlineAfter = '2024-06-01';
    dto.deadlineBefore = '2024-12-31';
    dto.status = 'active';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('rejects invalid region type', async () => {
    const dto = new SearchFiltersDto();
    dto.regions = ['ES', 123] as any;
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'regions')).toBe(true);
  });

  it('rejects invalid minAmount type', async () => {
    const dto = new SearchFiltersDto();
    dto.minAmount = 'invalid' as any;
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'minAmount')).toBe(true);
  });

  it('rejects invalid deadline format', async () => {
    const dto = new SearchFiltersDto();
    dto.deadlineAfter = 'not-a-date';
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'deadlineAfter')).toBe(true);
  });
});
