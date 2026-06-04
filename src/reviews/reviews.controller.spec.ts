import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let reviewsService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findByMovieId: jest.Mock;
    findById: jest.Mock;
    delete: jest.Mock;
    update: jest.Mock;
  };

  const user = { id: 2, email: 'john@example.com', role: 'USER' };
  const review = {
    id: 1,
    text: 'Great movie',
    rating: 9,
    movieId: 1,
    userId: user.id,
  };

  beforeEach(async () => {
    reviewsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByMovieId: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [{ provide: ReviewsService, useValue: reviewsService }],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create review for current user', () => {
    const dto = { text: 'Great movie', rating: 9, movieId: 1 };
    reviewsService.create.mockReturnValue(review);

    expect(controller.create(dto, user)).toBe(review);
    expect(reviewsService.create).toHaveBeenCalledWith(dto, user.id);
  });

  it('should return all reviews', () => {
    reviewsService.findAll.mockReturnValue([review]);

    expect(controller.findAll()).toEqual([review]);
    expect(reviewsService.findAll).toHaveBeenCalled();
  });

  it('should return reviews by movie id', () => {
    reviewsService.findByMovieId.mockReturnValue([review]);

    expect(controller.findByMovieId(1)).toEqual([review]);
    expect(reviewsService.findByMovieId).toHaveBeenCalledWith(1);
  });

  it('should delete own review', async () => {
    reviewsService.findById.mockResolvedValue(review);
    reviewsService.delete.mockResolvedValue(review);

    await expect(controller.delete(1, user)).resolves.toEqual({
      message: 'Review deleted successfully',
    });
    expect(reviewsService.delete).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when deleting missing review', async () => {
    reviewsService.findById.mockResolvedValue(null);

    await expect(controller.delete(999, user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when deleting another user review', async () => {
    reviewsService.findById.mockResolvedValue({ ...review, userId: 99 });

    await expect(controller.delete(1, user)).rejects.toThrow(
      ForbiddenException,
    );
    expect(reviewsService.delete).not.toHaveBeenCalled();
  });

  it('should update own review', async () => {
    reviewsService.findById.mockResolvedValue(review);
    reviewsService.update.mockResolvedValue({ ...review, rating: 8 });

    await expect(controller.update(1, { rating: 8 }, user)).resolves.toEqual({
      ...review,
      rating: 8,
    });
    expect(reviewsService.update).toHaveBeenCalledWith(1, { rating: 8 });
  });

  it('should throw NotFoundException when updating missing review', async () => {
    reviewsService.findById.mockResolvedValue(null);

    await expect(controller.update(999, { rating: 8 }, user)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw ForbiddenException when updating another user review', async () => {
    reviewsService.findById.mockResolvedValue({ ...review, userId: 99 });

    await expect(controller.update(1, { rating: 8 }, user)).rejects.toThrow(
      ForbiddenException,
    );
    expect(reviewsService.update).not.toHaveBeenCalled();
  });
});
