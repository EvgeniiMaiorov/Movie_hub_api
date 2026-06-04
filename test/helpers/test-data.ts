import { E2EContext } from './e2e-app';

export const createTestMovie = async (ctx: E2EContext) => {
  const movie = await ctx.prisma.movie.create({
    data: {
      title: 'E2E Test Movie',
      description: 'Movie created for E2E tests',
      releaseYear: 2026,
      genre: 'Test',
      rating: 8,
    },
  });

  ctx.testMovieIds.push(movie.id);

  return movie;
};
