import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  NotFoundException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
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

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    const review = await this.reviewsService.findById(id);

    if (!review) {
      throw new NotFoundException(`Review with id ${id} not found`);
    }

    if (review.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewsService.delete(id);

    return { message: 'Review deleted successfully' };
  }
}
