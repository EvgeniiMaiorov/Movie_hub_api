import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.movie.findMany();
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
