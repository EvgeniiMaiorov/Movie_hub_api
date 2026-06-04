import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';

type RegisterResponseBody = {
  email: string;
  name: string;
  password?: string;
};

type LoginResponseBody = {
  access_token: string;
};

type CurrentUserResponseBody = {
  id: number;
  email: string;
  role: string;
};

describe('Auth E2E', () => {
  let app: INestApplication;
  let httpApp: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new PrismaExceptionFilter());

    await app.init();
    httpApp = app.getHttpAdapter().getInstance() as App;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/register (POST)', async () => {
    const email = `test-${Date.now()}@example.com`;

    const response = await request(httpApp)
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'Test User',
      })
      .expect(201);
    const responseBody = response.body as RegisterResponseBody;

    expect(responseBody).toMatchObject({
      email,
      name: 'Test User',
    });

    expect(responseBody.password).toBeUndefined();
  });

  it('should login and get current user', async () => {
    const email = `test-${Date.now()}@example.com`;

    await request(httpApp)
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'John',
      })
      .expect(201);

    const loginResponse = await request(httpApp)
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      })
      .expect(201);
    const loginResponseBody = loginResponse.body as LoginResponseBody;

    const meResponse = await request(httpApp)
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponseBody.access_token}`)
      .expect(200);
    const meResponseBody = meResponse.body as CurrentUserResponseBody;

    expect(meResponseBody.email).toBe(email);
  });
});
