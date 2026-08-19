import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserStatus } from './enums/user-status.enum';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  const usersRepositoryMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const existingSuperuser = {
    id: 1,
    name: 'Administrador Liquida',
    email: 'admin@liquida.com',
    passwordHash: 'hashed-password',
    avatarUrl: null,
    role: UserRole.SUPERUSER,
    status: UserStatus.ACTIVE,
    emailVerifiedAt: new Date(),
    approvedAt: new Date(),
    approvedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: usersRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an active and verified superuser', async () => {
    usersRepositoryMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    usersRepositoryMock.create.mockImplementation(
      (data: Partial<User>) => data as User,
    );

    usersRepositoryMock.save.mockImplementation((user: User) =>
      Promise.resolve({
        ...user,
        id: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await service.createSuperuserIfMissing({
      name: ' Administrador Liquida ',
      email: 'ADMIN@LIQUIDA.COM',
      passwordHash: 'hashed-password',
    });

    expect(result.created).toBe(true);
    expect(result.user.email).toBe('admin@liquida.com');
    expect(result.user.name).toBe('Administrador Liquida');
    expect(result.user.role).toBe(UserRole.SUPERUSER);
    expect(result.user.status).toBe(UserStatus.ACTIVE);
    expect(result.user.emailVerifiedAt).toBeInstanceOf(Date);
    expect(result.user.approvedAt).toBeInstanceOf(Date);
    expect(result.user.approvedBy).toBeNull();
  });

  it('should not duplicate an existing superuser with the same email', async () => {
    usersRepositoryMock.findOne.mockResolvedValue(existingSuperuser);

    const result = await service.createSuperuserIfMissing({
      name: 'Administrador Liquida',
      email: 'ADMIN@LIQUIDA.COM',
      passwordHash: 'another-hash',
    });

    expect(result).toEqual({
      user: existingSuperuser,
      created: false,
    });

    expect(usersRepositoryMock.create).not.toHaveBeenCalled();
    expect(usersRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should reject a different superuser when one already exists', async () => {
    usersRepositoryMock.findOne.mockResolvedValue(existingSuperuser);

    await expect(
      service.createSuperuserIfMissing({
        name: 'Otro administrador',
        email: 'otro@liquida.com',
        passwordHash: 'hashed-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(usersRepositoryMock.save).not.toHaveBeenCalled();
  });

  it('should reject an email already assigned to a common user', async () => {
    const existingCommonUser = {
      ...existingSuperuser,
      role: UserRole.USER,
      status: UserStatus.PENDING_EMAIL_VERIFICATION,
    } as User;

    usersRepositoryMock.findOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(existingCommonUser);

    await expect(
      service.createSuperuserIfMissing({
        name: 'Administrador Liquida',
        email: existingCommonUser.email,
        passwordHash: 'hashed-password',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(usersRepositoryMock.save).not.toHaveBeenCalled();
  });
});
