import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Prisma } from '@prisma/client';

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

  async update(id: number, updatedMovieDto: UpdateMovieDto) {
    try {
      return await this.prisma.movie.update({
        where: { id },
        data: updatedMovieDto,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Movie with id ${id} not found`);
      }

      throw error;
    }
  }

  async delete(id: number) {
    try {
      return await this.prisma.movie.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`Movie with id ${id} not found`);
      }

      throw error;
    }
  }
}
