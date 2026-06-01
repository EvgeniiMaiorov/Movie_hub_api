import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ParseIntPipe } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { ReviewsService } from '../reviews/reviews.service';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly reviewsService: ReviewsService,
  ) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.moviesService.findAll(paginationDto);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeReviews') includeReviews?: string,
  ) {
    const movie = await this.moviesService.findById(
      id,
      includeReviews === 'true',
    );

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  @Get(':id/reviews')
  async findReviews(@Param('id', ParseIntPipe) id: number) {
    const movie = await this.moviesService.findById(id);

    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    return this.reviewsService.findByMovieId(id);
  }

  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.moviesService.delete(id);

    return { message: `Movie with id ${id} has been deleted successfully` };
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatedMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.update(id, updatedMovieDto);
  }
}
