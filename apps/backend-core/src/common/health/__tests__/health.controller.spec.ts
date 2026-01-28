import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            checkHealth: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const mockHealth = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        uptime: 3600,
        services: {
          database: 'up' as const,
          api: 'up' as const,
        },
        metrics: {
          memoryUsage: 50,
        },
      };

      jest.spyOn(service, 'checkHealth').mockResolvedValue(mockHealth);

      const result = await controller.check();

      expect(result.status).toBe('healthy');
      expect(result.services.database).toBe('up');
      expect(result.services.api).toBe('up');
    });

    it('should return degraded status when db is down', async () => {
      const mockHealth = {
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        uptime: 3600,
        services: {
          database: 'down' as const,
          api: 'up' as const,
        },
      };

      jest.spyOn(service, 'checkHealth').mockResolvedValue(mockHealth);

      const result = await controller.check();

      expect(result.status).toBe('unhealthy');
      expect(result.services.database).toBe('down');
    });
  });

  describe('GET /health/ready', () => {
    it('should return ready true when healthy', async () => {
      const mockHealth = {
        status: 'healthy' as const,
        timestamp: new Date().toISOString(),
        uptime: 3600,
        services: { database: 'up' as const, api: 'up' as const },
      };

      jest.spyOn(service, 'checkHealth').mockResolvedValue(mockHealth);

      const result = await controller.readiness();

      expect(result.ready).toBe(true);
    });

    it('should return ready false when unhealthy', async () => {
      const mockHealth = {
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        uptime: 3600,
        services: { database: 'down' as const, api: 'up' as const },
      };

      jest.spyOn(service, 'checkHealth').mockResolvedValue(mockHealth);

      const result = await controller.readiness();

      expect(result.ready).toBe(false);
    });
  });

  describe('GET /health/live', () => {
    it('should return alive true', async () => {
      const result = await controller.liveness();

      expect(result.alive).toBe(true);
    });
  });
});
