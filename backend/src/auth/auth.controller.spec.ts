import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';
import type { AuthenticatedRequest } from './interfaces/authenticated-request.interface';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    verifyEmail: jest.fn(),
    resendVerificationEmail: jest.fn(),
    login: jest.fn(),
    refresh: jest.fn(),
    logout: jest.fn(),
  };

  const configServiceMock = {
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the authenticated user without sensitive fields', () => {
    const user = {
      id: 10,
      name: 'Usuario Activo',
      email: 'activo@ejemplo.com',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      avatarUrl: null,
      emailVerifiedAt: new Date(),
      approvedAt: new Date(),
      approvedBy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      passwordHash: 'hash-que-no-debe-devolverse',
    } as User;

    const request = {
      user,
    } as unknown as AuthenticatedRequest;

    const result = controller.getAuthenticatedUser(request);

    expect(result).toEqual(
      expect.objectContaining({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      }),
    );

    expect(result).not.toHaveProperty('passwordHash');
  });
});
