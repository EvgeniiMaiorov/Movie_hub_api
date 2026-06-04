import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

describe('MoviesService', () => {
  let service: MoviesService;
  let mockPrismaService: {
    movie: {
      findMany: jest.Mock;
      count: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
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
    mockPrismaService = {
      movie: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

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
    const movies = [movie];

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
    expect(mockPrismaService.movie.findMany).toHaveBeenCalledWith({
      where: {},
      skip: 0,
      take: 10,
      orderBy: { id: 'asc' },
    });
    expect(mockPrismaService.movie.count).toHaveBeenCalledWith({ where: {} });
  });

  it('should search movies by title or genre', async () => {
    mockPrismaService.movie.findMany.mockResolvedValue([movie]);
    mockPrismaService.movie.count.mockResolvedValue(1);

    await service.findAll({ page: 2, limit: 5, search: 'sci' });

    const expectedWhere = {
      OR: [
        {
          title: {
            contains: 'sci',
            mode: 'insensitive',
          },
        },
        {
          genre: {
            contains: 'sci',
            mode: 'insensitive',
          },
        },
      ],
    };

    expect(mockPrismaService.movie.findMany).toHaveBeenCalledWith({
      where: expectedWhere,
      skip: 5,
      take: 5,
      orderBy: { id: 'asc' },
    });
    expect(mockPrismaService.movie.count).toHaveBeenCalledWith({
      where: expectedWhere,
    });
  });

  it('should find movie by id without reviews by default', async () => {
    mockPrismaService.movie.findUnique.mockResolvedValue(movie);

    const result = await service.findById(1);

    expect(result).toBe(movie);
    expect(mockPrismaService.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: undefined,
    });
  });

  it('should include reviews when requested', async () => {
    mockPrismaService.movie.findUnique.mockResolvedValue({
      ...movie,
      reviews: [],
    });

    await service.findById(1, true);

    expect(mockPrismaService.movie.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        reviews: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  });

  it('should create movie', async () => {
    const createMovieDto = {
      title: movie.title,
      description: movie.description,
      releaseYear: movie.releaseYear,
      genre: movie.genre,
      rating: movie.rating,
    };

    mockPrismaService.movie.create.mockResolvedValue(movie);

    const result = await service.create(createMovieDto);

    expect(result).toBe(movie);
    expect(mockPrismaService.movie.create).toHaveBeenCalledWith({
      data: createMovieDto,
    });
  });

  it('should update movie', async () => {
    mockPrismaService.movie.update.mockResolvedValue({
      ...movie,
      title: 'New title',
    });

    await service.update(1, { title: 'New title' });

    expect(mockPrismaService.movie.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { title: 'New title' },
    });
  });

  it('should delete movie', async () => {
    mockPrismaService.movie.delete.mockResolvedValue(movie);

    const result = await service.delete(1);

    expect(result).toBe(movie);
    expect(mockPrismaService.movie.delete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('should pass Prisma not found errors through update', async () => {
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
