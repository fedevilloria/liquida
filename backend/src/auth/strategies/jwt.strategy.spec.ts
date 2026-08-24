import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';
import { UserStatus } from '../../users/enums/user-status.enum';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { SessionService } from '../session.service';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const sessionServiceMock = {
    findActiveSession: jest.fn(),
  };

  const configServiceMock = {
    getOrThrow: jest.fn(),
  };

  const activeUser = {
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
  } as User;

  const payload: JwtPayload = {
    sub: activeUser.id,
    email: activeUser.email,
    role: activeUser.role,
    sessionId: 25,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    configServiceMock.getOrThrow.mockReturnValue(
      'test-secret-with-sufficient-length',
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: SessionService,
          useValue: sessionServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('should return the user when the session and account are active', async () => {
    sessionServiceMock.findActiveSession.mockResolvedValue({
      id: payload.sessionId,
      userId: activeUser.id,
      user: activeUser,
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
    });

    const result = await strategy.validate(payload);

    expect(result).toBe(activeUser);
    expect(sessionServiceMock.findActiveSession).toHaveBeenCalledWith(
      payload.sessionId,
      payload.sub,
    );
  });

  it('should reject a missing, expired or revoked session', async () => {
    sessionServiceMock.findActiveSession.mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should reject a user whose account is no longer active', async () => {
    const suspendedUser = {
      ...activeUser,
      status: UserStatus.SUSPENDED,
    } as User;

    sessionServiceMock.findActiveSession.mockResolvedValue({
      id: payload.sessionId,
      userId: suspendedUser.id,
      user: suspendedUser,
    });

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
