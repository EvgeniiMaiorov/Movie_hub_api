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
  UseGuards,
} from '@nestjs/common';

import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { ParseIntPipe } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { ReviewsService } from '../reviews/reviews.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Role } from 'src/generated/prisma';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.moviesService.delete(id);

    return { message: `Movie with id ${id} has been deleted successfully` };
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatedMovieDto: UpdateMovieDto,
  ) {
    return this.moviesService.update(id, updatedMovieDto);
  }
}
