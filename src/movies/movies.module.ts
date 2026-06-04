import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { PrismaModule } from '../prisma.module';
import { ReviewsModule } from '../reviews/reviews.module';

@Module({
  imports: [PrismaModule, ReviewsModule],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
