import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';
import { Client } from 'pg';

import { GrantsModule } from './grants.module';
import { GrantEntity } from '../database/entities/grant.entity';
import { SourceEntity } from '../database/entities/source.entity';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GrantRegion } from './dto/grant-region.enum';
import appConfig from '../config/app.config';
import { applyTestAppConfig } from '../../test/utils/test-app';

const runDbTests = process.env.RUN_DB_TESTS === 'true';
const describeDb = runDbTests ? describe : describe.skip;
const TEST_JWT_SECRET = 'test-jwt-secret-key-for-testing-only-32chars';

describeDb('Grants E2E Tests', () => {
  let app: INestApplication;
  let grantsRepository: any;
  let sourcesRepository: any;
  let validJwtToken: string;
  let invalidJwtToken: string;
  let testSourceId: string;

  beforeAll(async () => {
    const dbHost = process.env.DB_HOST || process.env.DATABASE_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || process.env.DATABASE_PORT || '5432', 10);
    const dbUser = process.env.DB_USER || process.env.DATABASE_USER || 'granter_dev';
    const dbPassword = process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || 'dev_password';
    const testDatabase = process.env.DB_TEST_NAME || process.env.DATABASE_TEST_NAME || 'granter_test';
    const adminDatabase = process.env.DB_ADMIN_NAME || 'postgres';

    const safeDbName = /^[a-zA-Z0-9_]+$/.test(testDatabase) ? testDatabase : 'granter_test';

    const adminClient = new Client({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: adminDatabase,
    });

    await adminClient.connect();
    const exists = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [safeDbName]);
    if (exists.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${safeDbName}"`);
    }
    await adminClient.end();

    process.env.JWT_SECRET = TEST_JWT_SECRET;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
          ignoreEnvFile: true,
          load: [appConfig],
        }),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: dbPassword,
          database: safeDbName,
          entities: [GrantEntity, SourceEntity],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: TEST_JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
        GrantsModule,
      ],
      providers: [JwtStrategy, JwtAuthGuard],
    })
      .overrideProvider(ConfigService)
      .useValue({
        get: (key: string) => {
          if (key === 'jwtSecret') return TEST_JWT_SECRET;
          if (key === 'serviceToken') return process.env.SERVICE_TOKEN;
          if (key === 'databaseUrl') return process.env.DATABASE_URL;
          if (key === 'env') return process.env.NODE_ENV ?? 'test';
          return undefined;
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    applyTestAppConfig(app);
    await app.init();

    grantsRepository = moduleFixture.get(getRepositoryToken(GrantEntity));
    sourcesRepository = moduleFixture.get(getRepositoryToken(SourceEntity));

    // Generate valid JWT token
    validJwtToken = jwt.sign({ sub: 'test-user-id', email: 'test@example.com', type: 'access' }, TEST_JWT_SECRET, {
      expiresIn: '1h',
    });

    // Create an invalid token
    invalidJwtToken = 'eyInvalidToken.eyInvalidPayload.eyInvalidSignature';
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear repositories
    await grantsRepository.query('TRUNCATE TABLE grants CASCADE');
    await sourcesRepository.query('TRUNCATE TABLE sources CASCADE');

    // Seed test source
    const source = await sourcesRepository.save({
      name: 'Test Source',
      url: 'https://example.com/test',
      region: GrantRegion.ES,
      active: true,
    });
    testSourceId = source.id;
  });

  describe('POST /grants - Create Grant', () => {
    describe('Authentication Tests', () => {
      it('should return 401 without JWT token', async () => {
        const response = await request(app.getHttpServer())
          .post('/grants')
          .send({
            title: 'Test Grant',
            description: 'Test Description',
            amount: 5000,
            deadline: '2025-12-31T00:00:00Z',
            region: GrantRegion.ES,
            sourceId: testSourceId,
          })
          .expect(401);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 401 with invalid JWT token', async () => {
        const response = await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${invalidJwtToken}`)
          .send({
            title: 'Test Grant',
            description: 'Test Description',
            amount: 5000,
            deadline: '2025-12-31T00:00:00Z',
            region: GrantRegion.ES,
            sourceId: testSourceId,
          })
          .expect(401);

        expect(response.body.error?.message).toBeDefined();
      });
    });

    describe('Create Success Cases', () => {
      it('should return 201 with valid data', async () => {
        const payload = {
          title: 'New Technology Grant',
          description: 'This is a test grant for technology sector',
          amount: 50000,
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.ES,
          sourceId: testSourceId,
        };

        const response = await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(201);

        const body = response.body.data;

        expect(body).toHaveProperty('id');
        expect(body.title).toBe(payload.title);
        expect(body.description).toBe(payload.description);
        expect(body.amount).toBe(payload.amount);
        expect(body.region).toBe(payload.region);
        expect(body.source).toBeDefined();
      });

      it('should create grant with minimum valid data', async () => {
        const payload = {
          title: 'Minimal Grant',
          description: 'Minimal description',
          amount: 1000,
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.EU,
          sourceId: testSourceId,
        };

        const response = await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(201);

        const body = response.body.data;

        expect(body.id).toBeDefined();
        expect(body.title).toBe(payload.title);
      });

      it('should create grant with different regions', async () => {
        const regions = [GrantRegion.ES, GrantRegion.EU, GrantRegion.INT];

        for (const region of regions) {
          const payload = {
            title: `Grant ${region}`,
            description: 'Regional test grant',
            amount: 25000,
            deadline: '2025-12-31T00:00:00Z',
            region,
            sourceId: testSourceId,
          };

          const response = await request(app.getHttpServer())
            .post('/grants')
            .set('Authorization', `Bearer ${validJwtToken}`)
            .send(payload)
            .expect(201);

          expect(response.body.data.region).toBe(region);
        }
      });
    });

    describe('Validation Error Cases', () => {
      it('should return 400 with missing title', async () => {
        const payload = {
          description: 'Test Description',
          amount: 5000,
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.ES,
          sourceId: testSourceId,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });

      it('should return 400 with missing description', async () => {
        const payload = {
          title: 'Test Grant',
          amount: 5000,
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.ES,
          sourceId: testSourceId,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });

      it('should return 400 with missing amount', async () => {
        const payload = {
          title: 'Test Grant',
          description: 'Test Description',
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.ES,
          sourceId: testSourceId,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });

      it('should return 400 with missing deadline', async () => {
        const payload = {
          title: 'Test Grant',
          description: 'Test Description',
          amount: 5000,
          region: GrantRegion.ES,
          sourceId: testSourceId,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });

      it('should return 400 with missing region', async () => {
        const payload = {
          title: 'Test Grant',
          description: 'Test Description',
          amount: 5000,
          deadline: '2025-12-31T00:00:00Z',
          sourceId: testSourceId,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });

      it('should return 400 with missing sourceId', async () => {
        const payload = {
          title: 'Test Grant',
          description: 'Test Description',
          amount: 5000,
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.ES,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });

      it('should return 400 with title too short', async () => {
        const payload = {
          title: 'Test',
          description: 'Test Description',
          amount: 5000,
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.ES,
          sourceId: testSourceId,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });

      it('should return 400 with negative amount', async () => {
        const payload = {
          title: 'Test Grant',
          description: 'Test Description',
          amount: -1000,
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.ES,
          sourceId: testSourceId,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });

      it('should return 400 with invalid deadline format', async () => {
        const payload = {
          title: 'Test Grant',
          description: 'Test Description',
          amount: 5000,
          deadline: 'not-a-date',
          region: GrantRegion.ES,
          sourceId: testSourceId,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });

      it('should return 400 with invalid region', async () => {
        const payload = {
          title: 'Test Grant',
          description: 'Test Description',
          amount: 5000,
          deadline: '2025-12-31T00:00:00Z',
          region: 'INVALID_REGION',
          sourceId: testSourceId,
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });
    });

    describe('Foreign Key Constraint Tests', () => {
      it('should return 400 with non-existent sourceId', async () => {
        const payload = {
          title: 'Test Grant',
          description: 'Test Description',
          amount: 5000,
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.ES,
          sourceId: '00000000-0000-0000-0000-000000000000',
        };

        await request(app.getHttpServer())
          .post('/grants')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send(payload)
          .expect(400);
      });
    });
  });

  describe('GET /grants - List Grants', () => {
    beforeEach(async () => {
      // Create multiple test grants
      const source = await sourcesRepository.findOne({ where: { id: testSourceId } });

      await grantsRepository.save([
        {
          title: 'Spain Grant 1',
          description: 'Grant for Spain',
          amount: 10000,
          deadline: new Date('2025-12-31'),
          region: GrantRegion.ES,
          source,
        },
        {
          title: 'Spain Grant 2',
          description: 'Another grant for Spain',
          amount: 20000,
          deadline: new Date('2025-11-30'),
          region: GrantRegion.ES,
          source,
        },
        {
          title: 'EU Grant 1',
          description: 'Grant for EU',
          amount: 15000,
          deadline: new Date('2025-10-31'),
          region: GrantRegion.EU,
          source,
        },
        {
          title: 'International Grant',
          description: 'International grant',
          amount: 50000,
          deadline: new Date('2025-09-30'),
          region: GrantRegion.INT,
          source,
        },
      ]);
    });

    it('should return 200 with array of grants', async () => {
      const response = await request(app.getHttpServer()).get('/grants').expect(200);

      const body = response.body.data;

      expect(body).toHaveProperty('data');
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('skip');
      expect(body).toHaveProperty('take');
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('should return grants in descending order by creation date', async () => {
      const response = await request(app.getHttpServer()).get('/grants').expect(200);

      const grants = response.body.data.data;
      for (let i = 1; i < grants.length; i++) {
        const prevDate = new Date(grants[i - 1].createdAt).getTime();
        const currentDate = new Date(grants[i].createdAt).getTime();
        expect(prevDate).toBeGreaterThanOrEqual(currentDate);
      }
    });

    it('should filter by region ES', async () => {
      const response = await request(app.getHttpServer()).get('/grants?region=ES').expect(200);

      const body = response.body.data;

      expect(body.data.length).toBe(2);
      expect(body.data.every((g: any) => g.region === GrantRegion.ES)).toBe(true);
    });

    it('should filter by region EU', async () => {
      const response = await request(app.getHttpServer()).get('/grants?region=EU').expect(200);

      const body = response.body.data;

      expect(body.data.length).toBe(1);
      expect(body.data[0].region).toBe(GrantRegion.EU);
    });

    it('should filter by region INT', async () => {
      const response = await request(app.getHttpServer()).get('/grants?region=INT').expect(200);

      const body = response.body.data;

      expect(body.data.length).toBe(1);
      expect(body.data[0].region).toBe(GrantRegion.INT);
    });

    it('should return empty array with non-matching region filter', async () => {
      const response = await request(app.getHttpServer()).get('/grants?region=NONEXISTENT').expect(200);

      expect(response.body.data.data.length).toBe(0);
    });

    it('should support pagination with skip parameter', async () => {
      const response1 = await request(app.getHttpServer()).get('/grants?skip=0&take=2').expect(200);

      const response2 = await request(app.getHttpServer()).get('/grants?skip=2&take=2').expect(200);

      expect(response1.body.data.data.length).toBe(2);
      expect(response2.body.data.data.length).toBe(2);
      expect(response1.body.data.skip).toBe(0);
      expect(response2.body.data.skip).toBe(2);
    });

    it('should enforce default pagination (take=20)', async () => {
      const response = await request(app.getHttpServer()).get('/grants').expect(200);

      expect(response.body.data.take).toBeLessThanOrEqual(20);
    });

    it('should enforce max 100 items pagination', async () => {
      const response = await request(app.getHttpServer()).get('/grants?skip=0&take=200').expect(200);

      expect(response.body.data.take).toBeLessThanOrEqual(100);
    });

    it('should return correct pagination metadata', async () => {
      const response = await request(app.getHttpServer()).get('/grants?skip=0&take=2').expect(200);

      const body = response.body.data;

      expect(body.skip).toBe(0);
      expect(body.take).toBe(2);
      expect(body.data.length).toBeGreaterThan(0);
      expect(body.total).toBeGreaterThanOrEqual(body.data.length);
    });

    it('should accept custom take parameter', async () => {
      const response = await request(app.getHttpServer()).get('/grants?take=5').expect(200);

      expect(response.body.data.take).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /grants/:id - Get Single Grant', () => {
    let grantId: string;

    beforeEach(async () => {
      const source = await sourcesRepository.findOne({ where: { id: testSourceId } });
      const grant = await grantsRepository.save({
        title: 'Single Test Grant',
        description: 'Test grant for single retrieval',
        amount: 25000,
        deadline: new Date('2025-12-31'),
        region: GrantRegion.ES,
        source,
      });
      grantId = grant.id;
    });

    it('should return 200 with grant object', async () => {
      const response = await request(app.getHttpServer()).get(`/grants/${grantId}`).expect(200);

      const body = response.body.data;

      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('title');
      expect(body).toHaveProperty('description');
      expect(body).toHaveProperty('amount');
      expect(body).toHaveProperty('deadline');
      expect(body).toHaveProperty('region');
      expect(body.id).toBe(grantId);
    });

    it('should return 200 with grant including source relation', async () => {
      const response = await request(app.getHttpServer()).get(`/grants/${grantId}`).expect(200);

      const body = response.body.data;

      expect(body.source).toBeDefined();
      expect(body.source).toHaveProperty('id');
      expect(body.source).toHaveProperty('name');
    });

    it('should return 404 for non-existent grant ID', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app.getHttpServer()).get(`/grants/${nonExistentId}`).expect(404);

      expect(response.body.error?.message).toBeDefined();
    });

    it('should return 400 with invalid ID format', async () => {
      const invalidId = 'not-a-valid-uuid';

      const response = await request(app.getHttpServer()).get(`/grants/${invalidId}`).expect(400);

      expect(response.body.error?.message).toBeDefined();
    });

    it('should return list endpoint on trailing slash', async () => {
      const response = await request(app.getHttpServer()).get('/grants/').expect(200);

      expect(Array.isArray(response.body.data.data)).toBe(true);
    });
  });

  describe('PUT /grants/:id - Update Grant', () => {
    let grantId: string;
    let sourceId: string;

    beforeEach(async () => {
      const source = await sourcesRepository.findOne({ where: { id: testSourceId } });
      sourceId = source.id;

      const grant = await grantsRepository.save({
        title: 'Original Title',
        description: 'Original Description',
        amount: 10000,
        deadline: new Date('2025-12-31'),
        region: GrantRegion.ES,
        source,
      });
      grantId = grant.id;
    });

    describe('Authentication Tests', () => {
      it('should return 401 without JWT token', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .send({
            title: 'Updated Title',
          })
          .expect(401);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 401 with invalid JWT token', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${invalidJwtToken}`)
          .send({
            title: 'Updated Title',
          })
          .expect(401);

        expect(response.body.error?.message).toBeDefined();
      });
    });

    describe('Update Success Cases', () => {
      it('should return 200 and update grant title', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            title: 'Updated Title',
          })
          .expect(200);

        const body = response.body.data;

        expect(body.title).toBe('Updated Title');
        expect(body.description).toBe('Original Description');
      });

      it('should return 200 and update grant description', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            description: 'Updated Description',
          })
          .expect(200);

        const body = response.body.data;

        expect(body.description).toBe('Updated Description');
        expect(body.title).toBe('Original Title');
      });

      it('should return 200 and update grant amount', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            amount: 50000,
          })
          .expect(200);

        expect(response.body.data.amount).toBe(50000);
      });

      it('should return 200 and update grant region', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            region: GrantRegion.EU,
          })
          .expect(200);

        expect(response.body.data.region).toBe(GrantRegion.EU);
      });

      it('should return 200 and update multiple fields', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            title: 'New Title',
            description: 'New Description',
            amount: 75000,
            region: GrantRegion.INT,
          })
          .expect(200);

        const body = response.body.data;

        expect(body.title).toBe('New Title');
        expect(body.description).toBe('New Description');
        expect(body.amount).toBe(75000);
        expect(body.region).toBe(GrantRegion.INT);
      });

      it('should persist changes to database', async () => {
        await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            title: 'Persisted Title',
          })
          .expect(200);

        const response = await request(app.getHttpServer()).get(`/grants/${grantId}`).expect(200);

        expect(response.body.data.title).toBe('Persisted Title');
      });
    });

    describe('Update Validation Tests', () => {
      it('should return 400 with invalid title (too short)', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            title: 'Test',
          })
          .expect(400);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 400 with negative amount', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            amount: -5000,
          })
          .expect(400);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 400 with invalid region', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            region: 'INVALID',
          })
          .expect(400);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 400 with zero amount', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            amount: 0,
          })
          .expect(400);

        expect(response.body.error?.message).toBeDefined();
      });
    });

    describe('Update Error Cases', () => {
      it('should return 404 for non-existent grant', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app.getHttpServer())
          .put(`/grants/${nonExistentId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            title: 'Updated Title',
          })
          .expect(404);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 400 with invalid ID format', async () => {
        const response = await request(app.getHttpServer())
          .put('/grants/invalid-id')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            title: 'Updated Title',
          })
          .expect(400);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 400 with non-existent sourceId', async () => {
        const response = await request(app.getHttpServer())
          .put(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .send({
            sourceId: '00000000-0000-0000-0000-000000000000',
          })
          .expect(400);

        expect(response.body.error?.message).toBeDefined();
      });
    });
  });

  describe('DELETE /grants/:id - Delete Grant', () => {
    let grantId: string;

    beforeEach(async () => {
      const source = await sourcesRepository.findOne({ where: { id: testSourceId } });
      const grant = await grantsRepository.save({
        title: 'Grant to Delete',
        description: 'This grant will be deleted',
        amount: 10000,
        deadline: new Date('2025-12-31'),
        region: GrantRegion.ES,
        source,
      });
      grantId = grant.id;
    });

    describe('Authentication Tests', () => {
      it('should return 401 without JWT token', async () => {
        const response = await request(app.getHttpServer()).delete(`/grants/${grantId}`).expect(401);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 401 with invalid JWT token', async () => {
        const response = await request(app.getHttpServer())
          .delete(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${invalidJwtToken}`)
          .expect(401);

        expect(response.body.error?.message).toBeDefined();
      });
    });

    describe('Delete Success Cases', () => {
      it('should return 204 and remove grant', async () => {
        await request(app.getHttpServer())
          .delete(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .expect(204);

        // Verify deletion
        await request(app.getHttpServer()).get(`/grants/${grantId}`).expect(404);
      });

      it('should remove grant from database', async () => {
        const source = await sourcesRepository.findOne({ where: { id: testSourceId } });
        const grantToDelete = await grantsRepository.save({
          title: 'Another Grant to Delete',
          description: 'Test deletion',
          amount: 5000,
          deadline: new Date('2025-12-31'),
          region: GrantRegion.ES,
          source,
        });
        const grantToDeleteId = grantToDelete.id;

        await request(app.getHttpServer())
          .delete(`/grants/${grantToDeleteId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .expect(204);

        const deletedGrant = await grantsRepository.findOne({
          where: { id: grantToDeleteId },
        });
        expect(deletedGrant).toBeNull();
      });

      it('should only delete specified grant', async () => {
        const source = await sourcesRepository.findOne({ where: { id: testSourceId } });
        const grant1 = await grantsRepository.save({
          title: 'Grant 1',
          description: 'First grant',
          amount: 10000,
          deadline: new Date('2025-12-31'),
          region: GrantRegion.ES,
          source,
        });

        const grant2 = await grantsRepository.save({
          title: 'Grant 2',
          description: 'Second grant',
          amount: 15000,
          deadline: new Date('2025-12-31'),
          region: GrantRegion.EU,
          source,
        });

        await request(app.getHttpServer())
          .delete(`/grants/${grant1.id}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .expect(204);

        // Check grant1 is deleted
        await request(app.getHttpServer()).get(`/grants/${grant1.id}`).expect(404);

        // Check grant2 still exists
        const response = await request(app.getHttpServer()).get(`/grants/${grant2.id}`).expect(200);

        expect(response.body.data.id).toBe(grant2.id);
      });
    });

    describe('Delete Error Cases', () => {
      it('should return 404 for non-existent grant', async () => {
        const nonExistentId = '00000000-0000-0000-0000-000000000000';

        const response = await request(app.getHttpServer())
          .delete(`/grants/${nonExistentId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .expect(404);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 400 with invalid ID format', async () => {
        const response = await request(app.getHttpServer())
          .delete('/grants/invalid-id')
          .set('Authorization', `Bearer ${validJwtToken}`)
          .expect(400);

        expect(response.body.error?.message).toBeDefined();
      });

      it('should return 404 when deleting already deleted grant', async () => {
        await request(app.getHttpServer())
          .delete(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .expect(204);

        const response = await request(app.getHttpServer())
          .delete(`/grants/${grantId}`)
          .set('Authorization', `Bearer ${validJwtToken}`)
          .expect(404);

        expect(response.body.error?.message).toBeDefined();
      });
    });
  });

  describe('Complex Scenarios and Edge Cases', () => {
    it('should handle CRUD cycle for single grant', async () => {
      // Create
      const createResponse = await request(app.getHttpServer())
        .post('/grants')
        .set('Authorization', `Bearer ${validJwtToken}`)
        .send({
          title: 'Lifecycle Test Grant',
          description: 'Test for complete CRUD cycle',
          amount: 35000,
          deadline: '2025-12-31T00:00:00Z',
          region: GrantRegion.ES,
          sourceId: testSourceId,
        })
        .expect(201);

      const grantId = createResponse.body.data.id;

      // Read
      const getResponse = await request(app.getHttpServer()).get(`/grants/${grantId}`).expect(200);

      expect(getResponse.body.data.title).toBe('Lifecycle Test Grant');

      // Update
      const updateResponse = await request(app.getHttpServer())
        .put(`/grants/${grantId}`)
        .set('Authorization', `Bearer ${validJwtToken}`)
        .send({
          amount: 45000,
        })
        .expect(200);

      expect(updateResponse.body.data.amount).toBe(45000);

      // Delete
      await request(app.getHttpServer())
        .delete(`/grants/${grantId}`)
        .set('Authorization', `Bearer ${validJwtToken}`)
        .expect(204);

      // Verify deletion
      await request(app.getHttpServer()).get(`/grants/${grantId}`).expect(404);
    });

    it('should return consistent pagination across multiple requests', async () => {
      const source = await sourcesRepository.findOne({ where: { id: testSourceId } });

      // Create 5 grants
      for (let i = 0; i < 5; i++) {
        await grantsRepository.save({
          title: `Grant ${i}`,
          description: `Test grant ${i}`,
          amount: 10000 * (i + 1),
          deadline: new Date('2025-12-31'),
          region: GrantRegion.ES,
          source,
        });
      }

      const response1 = await request(app.getHttpServer()).get('/grants?take=2').expect(200);

      const response2 = await request(app.getHttpServer()).get('/grants?take=2').expect(200);

      expect(response1.body.data.total).toBe(response2.body.data.total);
      expect(response1.body.data.take).toBe(response2.body.data.take);
    });

    it('should maintain data integrity after multiple operations', async () => {
      const source = await sourcesRepository.findOne({ where: { id: testSourceId } });

      // Create multiple grants
      const grant1 = await grantsRepository.save({
        title: 'Grant A',
        description: 'Test A',
        amount: 10000,
        deadline: new Date('2025-12-31'),
        region: GrantRegion.ES,
        source,
      });

      const grant2 = await grantsRepository.save({
        title: 'Grant B',
        description: 'Test B',
        amount: 20000,
        deadline: new Date('2025-11-30'),
        region: GrantRegion.EU,
        source,
      });

      // Update grant1
      await request(app.getHttpServer())
        .put(`/grants/${grant1.id}`)
        .set('Authorization', `Bearer ${validJwtToken}`)
        .send({
          amount: 15000,
        })
        .expect(200);

      // Verify grant1 and grant2
      const responseGrant1 = await request(app.getHttpServer()).get(`/grants/${grant1.id}`).expect(200);

      const responseGrant2 = await request(app.getHttpServer()).get(`/grants/${grant2.id}`).expect(200);

      expect(responseGrant1.body.data.amount).toBe(15000);
      expect(responseGrant2.body.data.amount).toBe(20000);
    });

    it('should filter correctly with multiple filters combined', async () => {
      const source = await sourcesRepository.findOne({ where: { id: testSourceId } });

      // Create grants with different regions
      await grantsRepository.save([
        {
          title: 'ES Grant 1',
          description: 'ES grant',
          amount: 10000,
          deadline: new Date('2025-12-31'),
          region: GrantRegion.ES,
          source,
        },
        {
          title: 'ES Grant 2',
          description: 'ES grant',
          amount: 20000,
          deadline: new Date('2025-12-31'),
          region: GrantRegion.ES,
          source,
        },
        {
          title: 'EU Grant',
          description: 'EU grant',
          amount: 30000,
          deadline: new Date('2025-12-31'),
          region: GrantRegion.EU,
          source,
        },
      ]);

      const response = await request(app.getHttpServer()).get('/grants?region=ES').expect(200);

      expect(response.body.data.data.length).toBe(2);
      expect(response.body.data.data.every((g: any) => g.region === GrantRegion.ES)).toBe(true);
    });
  });

  describe('Response Structure Validation', () => {
    it('should return proper error response structure on 400', async () => {
      const response = await request(app.getHttpServer())
        .post('/grants')
        .set('Authorization', `Bearer ${validJwtToken}`)
        .send({
          title: 'Test',
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error?.message).toBe('string');
    });

    it('should return proper error response structure on 401', async () => {
      const response = await request(app.getHttpServer())
        .post('/grants')
        .send({
          title: 'Test Grant',
        })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return proper error response structure on 404', async () => {
      const response = await request(app.getHttpServer())
        .get('/grants/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });

    it('should have source relation in grant response', async () => {
      const source = await sourcesRepository.findOne({ where: { id: testSourceId } });
      const grant = await grantsRepository.save({
        title: 'Test Grant',
        description: 'Test',
        amount: 10000,
        deadline: new Date('2025-12-31'),
        region: GrantRegion.ES,
        source,
      });

      const response = await request(app.getHttpServer()).get(`/grants/${grant.id}`).expect(200);

      expect(response.body.data.source).toBeDefined();
      expect(response.body.data.source.id).toBe(source.id);
    });
  });
});
