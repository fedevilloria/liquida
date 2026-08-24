import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SessionService } from './session.service';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    createPendingUser: jest.fn(),
    findByEmail: jest.fn(),
    findByEmailWithPassword: jest.fn(),
  };

  const emailVerificationServiceMock = {
    generateForUser: jest.fn(),
    verifyToken: jest.fn(),
    canResendForUser: jest.fn(),
  };

  const emailServiceMock = {
    sendEmailVerification: jest.fn(),
  };

  const sessionServiceMock = {
    createForUser: jest.fn(),
    rotate: jest.fn(),
    revoke: jest.fn(),
  };

  const jwtServiceMock = {
    signAsync: jest.fn(),
  };

  const configServiceMock = {
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: EmailVerificationService,
          useValue: emailVerificationServiceMock,
        },
        {
          provide: EmailService,
          useValue: emailServiceMock,
        },
        {
          provide: SessionService,
          useValue: sessionServiceMock,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const pendingUser = {
    id: 10,
    name: 'Usuario Pendiente',
    email: 'pendiente@ejemplo.com',
    role: UserRole.USER,
    status: UserStatus.PENDING_EMAIL_VERIFICATION,
    emailVerifiedAt: null,
    approvedAt: null,
    approvedBy: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  it('should resend verification when the pending user is allowed', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(pendingUser);
    emailVerificationServiceMock.canResendForUser.mockResolvedValue(true);
    emailVerificationServiceMock.generateForUser.mockResolvedValue({
      plainToken: 'a'.repeat(64),
      expiresAt: new Date(),
    });
    emailServiceMock.sendEmailVerification.mockResolvedValue(undefined);

    const result = await service.resendEmailVerification(pendingUser.email);

    expect(emailVerificationServiceMock.generateForUser).toHaveBeenCalledWith(
      pendingUser,
    );

    expect(emailServiceMock.sendEmailVerification).toHaveBeenCalledWith(
      pendingUser.email,
      pendingUser.name,
      'a'.repeat(64),
    );

    expect(result).toEqual({
      message:
        'Si existe una cuenta pendiente de verificación, enviaremos un nuevo correo.',
    });
  });

  it('should not resend verification during the cooldown', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(pendingUser);
    emailVerificationServiceMock.canResendForUser.mockResolvedValue(false);

    await service.resendEmailVerification(pendingUser.email);

    expect(emailVerificationServiceMock.generateForUser).not.toHaveBeenCalled();

    expect(emailServiceMock.sendEmailVerification).not.toHaveBeenCalled();
  });

  it('should return the neutral response for an unknown email', async () => {
    usersServiceMock.findByEmail.mockResolvedValue(null);

    const result = await service.resendEmailVerification(
      'inexistente@ejemplo.com',
    );

    expect(result).toEqual({
      message:
        'Si existe una cuenta pendiente de verificación, enviaremos un nuevo correo.',
    });

    expect(
      emailVerificationServiceMock.canResendForUser,
    ).not.toHaveBeenCalled();

    expect(emailServiceMock.sendEmailVerification).not.toHaveBeenCalled();
  });

  it('should not resend verification to an already verified user', async () => {
    usersServiceMock.findByEmail.mockResolvedValue({
      ...pendingUser,
      status: UserStatus.PENDING_APPROVAL,
    });

    await service.resendEmailVerification(pendingUser.email);

    expect(
      emailVerificationServiceMock.canResendForUser,
    ).not.toHaveBeenCalled();

    expect(emailServiceMock.sendEmailVerification).not.toHaveBeenCalled();
  });

  it('should rotate the session and issue a new access token', async () => {
    const activeUser = {
      ...pendingUser,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      approvedAt: new Date(),
    } as User;

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    sessionServiceMock.rotate.mockResolvedValue({
      session: {
        id: 30,
        userId: activeUser.id,
        user: activeUser,
        expiresAt,
        revokedAt: null,
      },
      user: activeUser,
      refreshToken: 'nuevo-refresh-token',
      expiresAt,
    });

    jwtServiceMock.signAsync.mockResolvedValue('nuevo-access-token');
    configServiceMock.getOrThrow.mockReturnValue(900);

    const result = await service.refresh('refresh-token-anterior', {
      userAgent: 'Jest',
      ipAddress: '127.0.0.1',
    });

    expect(sessionServiceMock.rotate).toHaveBeenCalledWith(
      'refresh-token-anterior',
      {
        userAgent: 'Jest',
        ipAddress: '127.0.0.1',
      },
    );

    expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
      sub: activeUser.id,
      email: activeUser.email,
      role: activeUser.role,
      sessionId: 30,
    });

    expect(result.response.accessToken).toBe('nuevo-access-token');
    expect(result.response.expiresIn).toBe(900);
    expect(result.refreshToken).toBe('nuevo-refresh-token');
    expect(result.refreshTokenExpiresAt).toBe(expiresAt);
  });

  it('should revoke the refresh token during logout', async () => {
    sessionServiceMock.revoke.mockResolvedValue(undefined);

    await service.logout('refresh-token');

    expect(sessionServiceMock.revoke).toHaveBeenCalledWith('refresh-token');
  });

  it('should allow an idempotent logout without a refresh token', async () => {
    await service.logout(undefined);

    expect(sessionServiceMock.revoke).not.toHaveBeenCalled();
  });
});
