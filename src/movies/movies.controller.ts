import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ParseIntPipe } from '@nestjs/common';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  findById(@Param('id', ParseIntPipe) id: number) {
    const movie = this.moviesService.findById(id);

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    const isDeleted = this.moviesService.delete(id);

    if (!isDeleted) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return { message: `Movie with id ${id} has been deleted successfully` };
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatedMovieDto: UpdateMovieDto,
  ) {
    const updatedMovie = this.moviesService.update(id, updatedMovieDto);

    if (!updatedMovie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return updatedMovie;
  }
}
