import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { PrismaExceptionFilter } from '../../src/common/filters/prisma-exception.filter';
import { PrismaService } from '../../src/prisma.service';

export type E2EContext = {
  app: INestApplication;
  httpApp: App;
  prisma: PrismaService;
  testEmails: string[];
  testMovieIds: number[];
};

export const setupE2EApp = async (): Promise<E2EContext> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new PrismaExceptionFilter());

  await app.init();

  return {
    app,
    httpApp: app.getHttpAdapter().getInstance() as App,
    prisma: moduleFixture.get<PrismaService>(PrismaService),
    testEmails: [],
    testMovieIds: [],
  };
};

export const cleanupE2EApp = async (ctx: E2EContext) => {
  await ctx.prisma.review.deleteMany({
    where: { movieId: { in: ctx.testMovieIds } },
  });
  await ctx.prisma.movie.deleteMany({
    where: { id: { in: ctx.testMovieIds } },
  });
  await ctx.prisma.user.deleteMany({
    where: { email: { in: ctx.testEmails } },
  });
  await ctx.app.close();
};
