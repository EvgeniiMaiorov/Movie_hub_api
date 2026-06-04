import request from 'supertest';
import { Role } from '../src/generated/prisma/client';
import { createTestEmail } from './helpers/auth';
import { cleanupE2EApp, E2EContext, setupE2EApp } from './helpers/e2e-app';
import {
  CurrentUserResponseBody,
  LoginResponseBody,
  RegisterResponseBody,
} from './helpers/response-types';

describe('Auth E2E', () => {
  let ctx: E2EContext;

  beforeAll(async () => {
    ctx = await setupE2EApp();
  });

  afterAll(async () => {
    await cleanupE2EApp(ctx);
  });

  it('/auth/register (POST)', async () => {
    const email = createTestEmail(ctx);

    const response = await request(ctx.httpApp)
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
    const email = createTestEmail(ctx);

    await request(ctx.httpApp)
      .post('/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'John',
      })
      .expect(201);

    const loginResponse = await request(ctx.httpApp)
      .post('/auth/login')
      .send({
        email,
        password: 'password123',
      })
      .expect(201);
    const loginResponseBody = loginResponse.body as LoginResponseBody;

    const meResponse = await request(ctx.httpApp)
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponseBody.access_token}`)
      .expect(200);
    const meResponseBody = meResponse.body as CurrentUserResponseBody;

    expect(meResponseBody.email).toBe(email);
    expect(meResponseBody.role).toBe(Role.USER);
  });
});
