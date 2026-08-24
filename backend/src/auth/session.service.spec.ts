import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UserSession } from './entities/user-session.entity';
import { SessionService } from './session.service';
import { DataSource } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';

describe('SessionService', () => {
  let service: SessionService;

  const sessionsRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const configServiceMock = {
    getOrThrow: jest.fn(),
  };
  const dataSourceMock = {
    transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        {
          provide: getRepositoryToken(UserSession),
          useValue: sessionsRepositoryMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: DataSource,
          useValue: dataSourceMock,
        },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an active session belonging to the user', async () => {
    const user = {
      id: 10,
      name: 'Usuario Activo',
      email: 'activo@ejemplo.com',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    } as User;

    const activeSession = {
      id: 25,
      userId: user.id,
      user,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    } as UserSession;

    sessionsRepositoryMock.findOne.mockResolvedValue(activeSession);

    const result = await service.findActiveSession(activeSession.id, user.id);

    expect(result).toBe(activeSession);

    expect(sessionsRepositoryMock.findOne).toHaveBeenCalledTimes(1);
  });

  it('should return null when the session is not active', async () => {
    sessionsRepositoryMock.findOne.mockResolvedValue(null);

    const result = await service.findActiveSession(25, 10);

    expect(result).toBeNull();
  });
});
