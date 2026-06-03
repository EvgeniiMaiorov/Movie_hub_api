import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

describe('MoviesService', () => {
  let service: MoviesService;

  const mockPrismaService = {
    movie: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all movies with pagination', async () => {
    const movies = [
      {
        id: 1,
        title: 'Interstellar',
        description: 'Space epic',
        releaseYear: 2014,
        genre: 'Sci-Fi',
        rating: 9,
      },
    ];

    mockPrismaService.movie.findMany.mockResolvedValue(movies);
    mockPrismaService.movie.count.mockResolvedValue(movies.length);

    const result = await service.findAll({ page: 1, limit: 10 });

    expect(result).toEqual({
      items: movies,
      meta: {
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
    expect(mockPrismaService.movie.findMany).toHaveBeenCalled();
    expect(mockPrismaService.movie.count).toHaveBeenCalled();
  });

  it('should throw NotFoundException when movie does not exist', async () => {
    const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '7.8.0',
    });

    mockPrismaService.movie.update.mockRejectedValue(error);

    await expect(
      service.update(999, {
        title: 'New title',
      }),
    ).rejects.toThrow(Prisma.PrismaClientKnownRequestError);
  });
});
