import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from 'src/prisma.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let mockPrismaService: {
    review: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      delete: jest.Mock;
      update: jest.Mock;
    };
  };

  const review = {
    id: 1,
    text: 'Great movie',
    rating: 9,
    movieId: 1,
    userId: 2,
  };

  beforeEach(async () => {
    mockPrismaService = {
      review: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create review for current user', async () => {
    mockPrismaService.review.create.mockResolvedValue(review);

    const result = await service.create(
      { text: 'Great movie', rating: 9, movieId: 1 },
      2,
    );

    expect(result).toBe(review);
    expect(mockPrismaService.review.create).toHaveBeenCalledWith({
      data: {
        text: 'Great movie',
        rating: 9,
        movieId: 1,
        userId: 2,
      },
    });
  });

  it('should return all reviews with movie and user', async () => {
    mockPrismaService.review.findMany.mockResolvedValue([review]);

    const result = await service.findAll();

    expect(result).toEqual([review]);
    expect(mockPrismaService.review.findMany).toHaveBeenCalledWith({
      include: {
        movie: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return reviews by movie id', async () => {
    mockPrismaService.review.findMany.mockResolvedValue([review]);

    const result = await service.findByMovieId(1);

    expect(result).toEqual([review]);
    expect(mockPrismaService.review.findMany).toHaveBeenCalledWith({
      where: { movieId: 1 },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should find review by id', async () => {
    mockPrismaService.review.findUnique.mockResolvedValue(review);

    const result = await service.findById(1);

    expect(result).toBe(review);
    expect(mockPrismaService.review.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        movie: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  });

  it('should delete review', async () => {
    mockPrismaService.review.delete.mockResolvedValue(review);

    const result = await service.delete(1);

    expect(result).toBe(review);
    expect(mockPrismaService.review.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should update review', async () => {
    mockPrismaService.review.update.mockResolvedValue({
      ...review,
      rating: 8,
    });

    await service.update(1, { rating: 8 });

    expect(mockPrismaService.review.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { rating: 8 },
    });
  });
});
