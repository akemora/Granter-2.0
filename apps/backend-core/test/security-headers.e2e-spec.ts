import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { applyTestAppConfig } from './utils/test-app';

describe('Security headers', () => {
  let app: INestApplication;
  let httpServer: request.SuperTest<request.Test>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'a'.repeat(64);
    process.env.SERVICE_TOKEN = 's'.repeat(32);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = applyTestAppConfig(moduleFixture.createNestApplication());
    await app.init();
    httpServer = request(app.getHttpServer());
  });

  afterAll(async () => {
    await app.close();
  });

  it('includes key security headers', async () => {
    const response = await httpServer.get('/health').expect(200);

    expect(response.headers['x-content-type-options']).toBeDefined();
    expect(response.headers['x-frame-options']).toBeDefined();
    expect(response.headers['strict-transport-security']).toBeDefined();
  });
});
