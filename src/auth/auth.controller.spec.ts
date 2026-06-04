import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '../generated/prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: {
    register: jest.Mock;
    login: jest.Mock;
  };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user', () => {
    const dto = {
      email: 'john@example.com',
      password: 'password123',
      name: 'John',
    };
    const response = { id: 1, email: dto.email, name: dto.name };
    authService.register.mockReturnValue(response);

    expect(controller.register(dto)).toBe(response);
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should login user', () => {
    const dto = { email: 'john@example.com', password: 'password123' };
    const response = { access_token: 'token' };
    authService.login.mockReturnValue(response);

    expect(controller.login(dto)).toBe(response);
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should return current user', () => {
    const user = { id: 1, email: 'john@example.com', role: Role.USER };

    expect(controller.me(user)).toBe(user);
  });
});
