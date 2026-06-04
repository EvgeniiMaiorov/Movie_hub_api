import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaExceptionFilter } from '../src/common/filters/prisma-exception.filter';
import { Role } from '../src/generated/prisma/client';
import { PrismaService } from '../src/prisma.service';

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
  role: Role;
};

type ReviewResponseBody = {
  id: number;
  text: string;
  rating: number;
  movieId: number;
  userId: number;
};

describe('Auth E2E', () => {
  let app: INestApplication;
  let httpApp: App;
  let prisma: PrismaService;
  let testMovieId: number;
  const testEmails: string[] = [];

  const createTestEmail = () => {
    const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

    testEmails.push(email);

    return email;
  };

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
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    const movie = await prisma.movie.create({
      data: {
        title: 'E2E Test Movie',
        description: 'Movie created for E2E review tests',
        releaseYear: 2026,
        genre: 'Test',
        rating: 8,
      },
    });

    testMovieId = movie.id;
  });

  afterAll(async () => {
    await prisma.review.deleteMany({
      where: { movieId: testMovieId },
    });
    await prisma.movie.delete({
      where: { id: testMovieId },
    });
    await prisma.user.deleteMany({
      where: { email: { in: testEmails } },
    });
    await app.close();
  });

  it('/auth/register (POST)', async () => {
    const email = createTestEmail();

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
    const email = createTestEmail();

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
    expect(meResponseBody.role).toBe(Role.USER);
  });

  it('should return 401 when creating review without token', async () => {
    await request(httpApp)
      .post('/reviews')
      .send({
        text: 'Review without token',
        rating: 7,
        movieId: testMovieId,
      })
      .expect(401);
  });

  it('should create review with token', async () => {
    const email = createTestEmail();

    await request(httpApp)
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'Review Author',
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

    const response = await request(httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${loginResponseBody.access_token}`)
      .send({
        text: 'Great E2E movie',
        rating: 9,
        movieId: testMovieId,
      })
      .expect(201);
    const responseBody = response.body as ReviewResponseBody;

    expect(responseBody).toMatchObject({
      text: 'Great E2E movie',
      rating: 9,
      movieId: testMovieId,
    });
    expect(responseBody.userId).toBeGreaterThan(0);
  });
});
