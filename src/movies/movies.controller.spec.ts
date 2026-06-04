import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { ReviewsService } from '../reviews/reviews.service';

describe('MoviesController', () => {
  let controller: MoviesController;
  let moviesService: {
    findAll: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  let reviewsService: {
    findByMovieId: jest.Mock;
  };

  const movie = {
    id: 1,
    title: 'Interstellar',
    description: 'Space epic',
    releaseYear: 2014,
    genre: 'Sci-Fi',
    rating: 9,
  };

  beforeEach(async () => {
    moviesService = {
      findAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    reviewsService = {
      findByMovieId: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        { provide: MoviesService, useValue: moviesService },
        { provide: ReviewsService, useValue: reviewsService },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return paginated movies', () => {
    const response = { items: [movie], meta: { total: 1 } };
    moviesService.findAll.mockReturnValue(response);

    expect(controller.findAll({ page: 1, limit: 10 })).toBe(response);
    expect(moviesService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });

  it('should return movie by id', async () => {
    moviesService.findById.mockResolvedValue(movie);

    await expect(controller.findById(1)).resolves.toBe(movie);
    expect(moviesService.findById).toHaveBeenCalledWith(1, false);
  });

  it('should include reviews by query flag', async () => {
    moviesService.findById.mockResolvedValue({ ...movie, reviews: [] });

    await controller.findById(1, 'true');

    expect(moviesService.findById).toHaveBeenCalledWith(1, true);
  });

  it('should throw NotFoundException when movie does not exist', async () => {
    moviesService.findById.mockResolvedValue(null);

    await expect(controller.findById(999)).rejects.toThrow(NotFoundException);
  });

  it('should return reviews for existing movie', async () => {
    const reviews = [{ id: 1, text: 'Great' }];
    moviesService.findById.mockResolvedValue(movie);
    reviewsService.findByMovieId.mockResolvedValue(reviews);

    await expect(controller.findReviews(1)).resolves.toBe(reviews);
    expect(reviewsService.findByMovieId).toHaveBeenCalledWith(1);
  });

  it('should throw NotFoundException when reviews movie does not exist', async () => {
    moviesService.findById.mockResolvedValue(null);

    await expect(controller.findReviews(999)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should create movie', () => {
    const dto = {
      title: movie.title,
      description: movie.description,
      releaseYear: movie.releaseYear,
      genre: movie.genre,
      rating: movie.rating,
    };
    moviesService.create.mockReturnValue(movie);

    expect(controller.create(dto)).toBe(movie);
    expect(moviesService.create).toHaveBeenCalledWith(dto);
  });

  it('should update movie', () => {
    moviesService.update.mockReturnValue({ ...movie, title: 'Updated' });

    controller.update(1, { title: 'Updated' });

    expect(moviesService.update).toHaveBeenCalledWith(1, { title: 'Updated' });
  });

  it('should delete movie and return message', async () => {
    moviesService.delete.mockResolvedValue(movie);

    await expect(controller.delete(1)).resolves.toEqual({
      message: 'Movie with id 1 has been deleted successfully',
    });
    expect(moviesService.delete).toHaveBeenCalledWith(1);
  });
});
