import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { User } from '../users/entities/user.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { EmailVerificationService } from './email-verification.service';
import { DataSource, IsNull } from 'typeorm';

describe('EmailVerificationService', () => {
  let service: EmailVerificationService;

  const tokensRepositoryMock = {
    delete: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const configServiceMock = {
    getOrThrow: jest.fn(),
  };

  const dataSourceMock = {
    transaction: jest.fn(),
  };

  const user = {
    id: 10,
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();
    tokensRepositoryMock.findOne.mockResolvedValue(null);

    configServiceMock.getOrThrow.mockReturnValue(24);
    tokensRepositoryMock.delete.mockResolvedValue({
      affected: 0,
      raw: [],
    });
    tokensRepositoryMock.create.mockImplementation(
      (data: Partial<EmailVerificationToken>) => data as EmailVerificationToken,
    );
    tokensRepositoryMock.save.mockImplementation(
      (token: EmailVerificationToken) => Promise.resolve(token),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        {
          provide: getRepositoryToken(EmailVerificationToken),
          useValue: tokensRepositoryMock,
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

    service = module.get<EmailVerificationService>(EmailVerificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a token and persist only its hash', async () => {
    const beforeGeneration = Date.now();

    const result = await service.generateForUser(user);

    const afterGeneration = Date.now();

    expect(result.plainToken).toHaveLength(64);
    expect(result.plainToken).toMatch(/^[a-f0-9]{64}$/);

    expect(tokensRepositoryMock.delete).toHaveBeenCalledWith({
      userId: user.id,
      usedAt: IsNull(),
    });

    const expectedHash = createHash('sha256')
      .update(result.plainToken)
      .digest('hex');

    expect(expectedHash).not.toBe(result.plainToken);

    expect(tokensRepositoryMock.create).toHaveBeenCalledWith({
      tokenHash: expectedHash,
      expiresAt: result.expiresAt,
      usedAt: null,
      userId: user.id,
      user,
    });

    const expectedDuration = 24 * 60 * 60 * 1000;

    expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(
      beforeGeneration + expectedDuration,
    );
    expect(result.expiresAt.getTime()).toBeLessThanOrEqual(
      afterGeneration + expectedDuration,
    );

    expect(tokensRepositoryMock.save).toHaveBeenCalledTimes(1);
  });

  it('should hash the same token consistently', () => {
    const plainToken = 'token-de-prueba';

    const firstHash = service.hashToken(plainToken);
    const secondHash = service.hashToken(plainToken);

    expect(firstHash).toBe(secondHash);
    expect(firstHash).toHaveLength(64);
    expect(firstHash).not.toBe(plainToken);
  });

  it('should allow resending when no unused token exists', async () => {
    tokensRepositoryMock.findOne.mockResolvedValue(null);

    const result = await service.canResendForUser(user.id);

    expect(result).toBe(true);
    expect(tokensRepositoryMock.findOne).toHaveBeenCalledWith({
      where: {
        userId: user.id,
        usedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  });

  it('should prevent resending during the configured cooldown', async () => {
    configServiceMock.getOrThrow.mockReturnValue(60);

    tokensRepositoryMock.findOne.mockResolvedValue({
      userId: user.id,
      usedAt: null,
      createdAt: new Date(),
    });

    const result = await service.canResendForUser(user.id);

    expect(result).toBe(false);
  });

  it('should allow resending after the cooldown has elapsed', async () => {
    configServiceMock.getOrThrow.mockReturnValue(60);

    tokensRepositoryMock.findOne.mockResolvedValue({
      userId: user.id,
      usedAt: null,
      createdAt: new Date(Date.now() - 61_000),
    });

    const result = await service.canResendForUser(user.id);

    expect(result).toBe(true);
  });
});
