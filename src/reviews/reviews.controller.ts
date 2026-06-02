import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createReviewDto: CreateReviewDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.reviewsService.create(createReviewDto, user.id);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get('movie/:movieId')
  findByMovieId(@Param('movieId', ParseIntPipe) movieId: number) {
    return this.reviewsService.findByMovieId(movieId);
  }
}
