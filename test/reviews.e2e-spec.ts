import request from 'supertest';
import { registerAndLogin } from './helpers/auth';
import { cleanupE2EApp, E2EContext, setupE2EApp } from './helpers/e2e-app';
import {
  ErrorResponseBody,
  ReviewResponseBody,
} from './helpers/response-types';
import { createTestMovie } from './helpers/test-data';

describe('Reviews E2E', () => {
  let ctx: E2EContext;
  let testMovieId: number;

  beforeAll(async () => {
    ctx = await setupE2EApp();

    const movie = await createTestMovie(ctx);

    testMovieId = movie.id;
  });

  afterAll(async () => {
    await cleanupE2EApp(ctx);
  });

  it('should return 401 when creating review without token', async () => {
    await request(ctx.httpApp)
      .post('/reviews')
      .send({
        text: 'Review without token',
        rating: 7,
        movieId: testMovieId,
      })
      .expect(401);
  });

  it('should create review with token', async () => {
    const author = await registerAndLogin(ctx, 'Review Author');

    const response = await request(ctx.httpApp)
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
    const author = await registerAndLogin(ctx, 'Review Owner');
    const anotherUser = await registerAndLogin(ctx, 'Another User');

    const reviewResponse = await request(ctx.httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Owned review',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    const response = await request(ctx.httpApp)
      .delete(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${anotherUser.token}`)
      .expect(403);
    const responseBody = response.body as ErrorResponseBody;

    expect(responseBody.message).toContain('own reviews');
  });

  it('should return 403 when another user updates a review', async () => {
    const author = await registerAndLogin(ctx, 'Review Owner');
    const anotherUser = await registerAndLogin(ctx, 'Another User');

    const reviewResponse = await request(ctx.httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Review to update',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    const response = await request(ctx.httpApp)
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
    const author = await registerAndLogin(ctx, 'Review Owner');

    const reviewResponse = await request(ctx.httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Review to delete once',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    await request(ctx.httpApp)
      .delete(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);

    await request(ctx.httpApp)
      .delete(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(404);
  });

  it('should allow review owner to delete review', async () => {
    const author = await registerAndLogin(ctx, 'Review Owner');

    const reviewResponse = await request(ctx.httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Owner can delete this review',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    const response = await request(ctx.httpApp)
      .delete(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${author.token}`)
      .expect(200);

    expect(response.body).toMatchObject({
      message: 'Review deleted successfully',
    });
  });

  it('should allow review owner to update review', async () => {
    const author = await registerAndLogin(ctx, 'Review Owner');

    const reviewResponse = await request(ctx.httpApp)
      .post('/reviews')
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Review before update',
        rating: 8,
        movieId: testMovieId,
      })
      .expect(201);
    const reviewResponseBody = reviewResponse.body as ReviewResponseBody;

    const response = await request(ctx.httpApp)
      .patch(`/reviews/${reviewResponseBody.id}`)
      .set('Authorization', `Bearer ${author.token}`)
      .send({
        text: 'Updated text',
      })
      .expect(200);
    const responseBody = response.body as ReviewResponseBody;

    expect(responseBody.text).toBe('Updated text');
    expect(responseBody.rating).toBe(8);
  });
});
