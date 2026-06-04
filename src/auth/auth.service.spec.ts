import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findByEmail: jest.Mock;
    create: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
  };

  const user = {
    id: 1,
    email: 'john@example.com',
    password: 'hashed-password',
    name: 'John',
    role: 'USER',
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register user with hashed password', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    usersService.create.mockResolvedValue(user);

    const result = await service.register({
      email: user.email,
      password: 'password123',
      name: user.name,
    });

    expect(result).toEqual({
      id: user.id,
      email: user.email,
      name: user.name,
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(usersService.create).toHaveBeenCalledWith({
      email: user.email,
      password: 'hashed-password',
      name: user.name,
    });
  });

  it('should throw BadRequestException when email already exists', async () => {
    usersService.findByEmail.mockResolvedValue(user);

    await expect(
      service.register({
        email: user.email,
        password: 'password123',
        name: user.name,
      }),
    ).rejects.toThrow(BadRequestException);
    expect(usersService.create).not.toHaveBeenCalled();
  });

  it('should login user and return access token', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);
    jwtService.signAsync.mockResolvedValue('signed-token');

    const result = await service.login({
      email: user.email,
      password: 'password123',
    });

    expect(result).toEqual({ access_token: 'signed-token' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', user.password);
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
  });

  it('should throw UnauthorizedException when user does not exist', async () => {
    usersService.findByEmail.mockResolvedValue(null);

    await expect(
      service.login({ email: user.email, password: 'password123' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(bcrypt.compare).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password does not match', async () => {
    usersService.findByEmail.mockResolvedValue(user);
    jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

    await expect(
      service.login({ email: user.email, password: 'wrong-password' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
