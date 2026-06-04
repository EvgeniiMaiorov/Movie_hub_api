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

type ErrorResponseBody = {
  message: string | string[];
};

describe('Auth E2E', () => {
  let app: INestApplication;
  let httpApp: App;
  let prisma: PrismaService;
  let testMovieId: number;
  const testMovieIds: number[] = [];
  const testEmails: string[] = [];

  const createTestEmail = () => {
    const email = `test-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;

    testEmails.push(email);

    return email;
  };

  const registerAndLogin = async (
    name = 'E2E User',
    role: Role = Role.USER,
  ) => {
    const email = createTestEmail();

    await request(httpApp)
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        name,
      })
      .expect(201);

    if (role !== Role.USER) {
      await prisma.user.update({
        where: { email },
        data: { role },
      });
    }

    const loginResponse = await request(httpApp)
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      })
      .expect(201);
    const loginResponseBody = loginResponse.body as LoginResponseBody;

    return {
      email,
      token: loginResponseBody.access_token,
    };
  };

  const createTestMovie = async () => {
    const movie = await prisma.movie.create({
      data: {
        title: 'E2E Test Movie',
        description: 'Movie created for E2E tests',
        releaseYear: 2026,
        genre: 'Test',
        rating: 8,
      },
    });

    testMovieIds.push(movie.id);

    return movie;
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

    const movie = await createTestMovie();

    testMovieId = movie.id;
  });

  afterAll(async () => {
    await prisma.review.deleteMany({
      where: { movieId: { in: testMovieIds } },
    });
    await prisma.movie.deleteMany({
      where: { id: { in: testMovieIds } },
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
    const author = await registerAndLogin('Review Author');

    const response = await request(httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
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

  it('should return 403 when another user deletes a review', async () => {
    const author = await registerAndLogin('Review Owner');
    const anotherUser = await registerAndLogin('Another User');

    const reviewResponse = await request(httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Owned review',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    const response = await request(httpApp)
      .delete(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${anotherUser.token}`)
      .expect(403);
    const responseBody = response.body as ErrorResponseBody;

    expect(responseBody.message).toContain('own reviews');
  });

  it('should return 403 when another user updates a review', async () => {
    const author = await registerAndLogin('Review Owner');
    const anotherUser = await registerAndLogin('Another User');

    const reviewResponse = await request(httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Review to update',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    const response = await request(httpApp)
      .patch(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${anotherUser.token}`)
      .send({
        text: 'Illegal update',
      })
      .expect(403);
    const responseBody = response.body as ErrorResponseBody;

    expect(responseBody.message).toContain('own reviews');
  });

  it('should return 404 when deleting already deleted review', async () => {
    const author = await registerAndLogin('Review Owner');

    const reviewResponse = await request(httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Review to delete once',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    await request(httpApp)
      .delete(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);

    await request(httpApp)
      .delete(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(404);
  });

  it('should allow review owner to delete review', async () => {
    const author = await registerAndLogin('Review Owner');

    const reviewResponse = await request(httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Owner can delete this review',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    const response = await request(httpApp)
      .delete(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Review deleted successfully',
    });
  });

  it('should allow review owner to update review', async () => {
    const author = await registerAndLogin('Review Owner');

    const reviewResponse = await request(httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Review before update',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    const response = await request(httpApp)
      .patch(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Updated text',
      })
      .expect(200);
    const responseBody = response.body as ReviewResponseBody;

    expect(responseBody.text).toBe('Updated text');
  });

  it('should return 403 when user deletes movie', async () => {
    const user = await registerAndLogin('Movie User');
    const movie = await createTestMovie();

    await request(httpApp)
      .delete(`/movies/${movie.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(403);
  });

  it('should allow admin to delete movie', async () => {
    const admin = await registerAndLogin('Movie Admin', Role.ADMIN);
    const movie = await createTestMovie();

    await request(httpApp)
      .delete(`/movies/${movie.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);
  });
});
