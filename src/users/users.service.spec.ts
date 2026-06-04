import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from 'src/prisma.service';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrismaService: {
    user: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
  };

  const user = {
    id: 1,
    email: 'john@example.com',
    password: 'hashed-password',
    name: 'John',
  };

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find user by email', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(user);

    const result = await service.findByEmail(user.email);

    expect(result).toBe(user);
    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
  });

  it('should create user', async () => {
    const data = {
      email: user.email,
      password: user.password,
      name: user.name,
    };
    mockPrismaService.user.create.mockResolvedValue(user);

    const result = await service.create(data);

    expect(result).toBe(user);
    expect(mockPrismaService.user.create).toHaveBeenCalledWith({ data });
  });
});
