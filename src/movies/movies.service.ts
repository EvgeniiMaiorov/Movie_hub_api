import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.movie.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.movie.count(),
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

  findById(id: number) {
    return this.prisma.movie.findUnique({
      where: { id },
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
