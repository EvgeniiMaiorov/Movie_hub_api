import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createReviewDto: CreateReviewDto, userId: number) {
    return this.prisma.review.create({
      data: {
        text: createReviewDto.text,
        rating: createReviewDto.rating,
        movieId: createReviewDto.movieId,
        userId,
      },
    });
  }

  findAll() {
    return this.prisma.review.findMany({
      include: {
        movie: true,
      },
    });
  }

  findByMovieId(movieId: number) {
    return this.prisma.review.findMany({
      where: { movieId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
