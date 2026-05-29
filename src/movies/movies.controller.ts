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

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    const movie = this.moviesService.findById(Number(id));

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
  delete(@Param('id') id: string) {
    const isDeleted = this.moviesService.delete(Number(id));

    if (!isDeleted) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return { message: `Movie with id ${id} has been deleted successfully` };
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatedMovieDto: UpdateMovieDto) {
    const updatedMovie = this.moviesService.update(Number(id), updatedMovieDto);

    if (!updatedMovie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return updatedMovie;
  }
}
