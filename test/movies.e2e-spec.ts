import request from 'supertest';
import { Role } from '../src/generated/prisma/client';
import { registerAndLogin } from './helpers/auth';
import { cleanupE2EApp, E2EContext, setupE2EApp } from './helpers/e2e-app';
import { createTestMovie } from './helpers/test-data';

describe('Movies E2E', () => {
  let ctx: E2EContext;

  beforeAll(async () => {
    ctx = await setupE2EApp();
  });

  afterAll(async () => {
    await cleanupE2EApp(ctx);
  });

  it('should return 403 when user deletes movie', async () => {
    const user = await registerAndLogin(ctx, 'Movie User');
    const movie = await createTestMovie(ctx);

    await request(ctx.httpApp)
      .delete(`/movies/${movie.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .expect(403);
  });

  it('should allow admin to delete movie', async () => {
    const admin = await registerAndLogin(ctx, 'Movie Admin', Role.ADMIN);
    const movie = await createTestMovie(ctx);

    await request(ctx.httpApp)
      .delete(`/movies/${movie.id}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .expect(200);

    await request(ctx.httpApp).get(`/movies/${movie.id}`).expect(404);
  });
});
