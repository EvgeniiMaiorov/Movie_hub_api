import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(paginationDto: PaginationDto) {
    const { page, limit, search } = paginationDto;

    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            {
              title: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              genre: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      this.prisma.movie.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.movie.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  findById(id: number, includeReviews = false) {
    return this.prisma.movie.findUnique({
      where: { id },
      include: includeReviews
        ? {
            reviews: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          }
        : undefined,
    });
  }

  create(createMovieDto: CreateMovieDto) {
    return this.prisma.movie.create({
      data: createMovieDto,
    });
  }

  update(id: number, updatedMovieDto: UpdateMovieDto) {
    return this.prisma.movie.update({
      where: { id },
      data: updatedMovieDto,
    });
  }

  delete(id: number) {
    return this.prisma.movie.delete({
      where: { id },
    });
  }
}
