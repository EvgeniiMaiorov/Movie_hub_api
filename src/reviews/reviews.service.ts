import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

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
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByMovieId(movieId: number) {
    return this.prisma.review.findMany({
      where: { movieId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.review.findUnique({
      where: { id },
      include: {
        movie: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  delete(id: number) {
    return this.prisma.review.delete({
      where: { id },
    });
  }

  update(id: number, updatedReviewDto: UpdateReviewDto) {
    return this.prisma.review.update({
      where: { id },
      data: updatedReviewDto,
    });
  }
}
