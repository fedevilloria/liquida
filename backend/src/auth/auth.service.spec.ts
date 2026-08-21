import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';
import { EmailVerificationService } from './email-verification.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';

describe('AuthService', () => {
  let service: AuthService;

  const usersServiceMock = {
    createPendingUser: jest.fn(),
    findByEmail: jest.fn(),
  };

  const emailVerificationServiceMock = {
    generateForUser: jest.fn(),
    verifyToken: jest.fn(),
    canResendForUser: jest.fn(),
  };

  const emailServiceMock = {
    sendEmailVerification: jest.fn(),
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
});
