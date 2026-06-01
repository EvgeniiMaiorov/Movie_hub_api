import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { PrismaService } from 'src/prisma.service';
import { ReviewsService } from '../reviews/reviews.service';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService, PrismaService, ReviewsService],
})
export class MoviesModule {}
