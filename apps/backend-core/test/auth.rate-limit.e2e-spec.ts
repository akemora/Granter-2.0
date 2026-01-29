import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { UserEntity } from '../src/database/entities/user.entity';
import { applyTestAppConfig } from './utils/test-app';

describe('Auth rate limiting', () => {
  let app: INestApplication;
  let httpServer: request.SuperTest<request.Test>;
  let dataSource: DataSource;

  const credentials = {
    email: 'rate-limit@example.com',
    password: 'StrongPassword123',
  };

  beforeAll(async () => {
    process.env.JWT_SECRET = 'a'.repeat(64);
    process.env.SERVICE_TOKEN = 's'.repeat(32);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = applyTestAppConfig(moduleFixture.createNestApplication());
    await app.init();
    dataSource = moduleFixture.get(DataSource);
    httpServer = request(app.getHttpServer());
  });

  beforeEach(async () => {
    await dataSource.getRepository(UserEntity).delete({ email: credentials.email });
  });

  afterAll(async () => {
    await app.close();
  });

  it('rate limits login after 5 attempts', async () => {
    await httpServer.post('/auth/register').send(credentials).expect(201);

    for (let i = 0; i < 5; i += 1) {
      await httpServer
        .post('/auth/login')
        .send({ email: credentials.email, password: 'WrongPassword123' })
        .expect(401);
    }

    await httpServer
      .post('/auth/login')
      .send({ email: credentials.email, password: 'WrongPassword123' })
      .expect(429);
  });
});
