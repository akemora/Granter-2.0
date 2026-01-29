import { HealthService } from '../health.service';
import { DataSource } from 'typeorm';

describe('HealthService', () => {
  const createService = (queryImpl: jest.Mock) => {
    const dataSource = { query: queryImpl } as unknown as DataSource;
    return new HealthService(dataSource);
  };

  it('reports healthy when database responds', async () => {
    const query = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    const service = createService(query);

    const result = await service.checkHealth();

    expect(result.status).toBe('healthy');
    expect(result.services.database).toBe('up');
    expect(result.services.api).toBe('up');
    expect(result.metrics.memoryUsage).toBeGreaterThan(0);
    expect(query).toHaveBeenCalledWith('SELECT 1');
  });

  it('reports unhealthy when database fails', async () => {
    const query = jest.fn().mockRejectedValue(new Error('db down'));
    const service = createService(query);

    const result = await service.checkHealth();

    expect(result.status).toBe('unhealthy');
    expect(result.services.database).toBe('down');
    expect(result.services.api).toBe('up');
  });
});
