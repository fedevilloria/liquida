import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';

import { User } from './entities/user.entity';
import { UserRole } from './enums/user-role.enum';
import { UserStatus } from './enums/user-status.enum';

interface CreatePendingUserData {
  name: string;
  email: string;
  passwordHash: string;
}
interface CreateSuperuserData {
  name: string;
  email: string;
  passwordHash: string;
}

export interface SuperuserCreationResult {
  user: User;
  created: boolean;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Registra una cuenta común pendiente de verificación.
   *
   * El rol y el estado no se reciben desde el cliente:
   * el backend los asigna obligatoriamente.
   */
  async createPendingUser(data: CreatePendingUserData): Promise<User> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingUser = await this.usersRepository.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      throw new ConflictException(
        'Ya existe una cuenta registrada con ese correo electrónico.',
      );
    }

    const user = this.usersRepository.create({
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      avatarUrl: null,
      role: UserRole.USER,
      status: UserStatus.PENDING_EMAIL_VERIFICATION,
      emailVerifiedAt: null,
      approvedAt: null,
      approvedBy: null,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error: unknown) {
      /**
       * PostgreSQL utiliza el código 23505 para informar
       * una violación de restricción UNIQUE.
       *
       * Esta segunda comprobación cubre registros simultáneos
       * realizados con el mismo correo.
       */
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'Ya existe una cuenta registrada con ese correo electrónico.',
        );
      }

      throw error;
    }
  }
  /**
   * Crea el único superusuario del sistema.
   * Si ya existe con el mismo correo, no lo duplica.
   * Si existe otro superusuario o el correo pertenece
   * a una cuenta común, detiene la operación.
   */
  async createSuperuserIfMissing(
    data: CreateSuperuserData,
  ): Promise<SuperuserCreationResult> {
    const normalizedEmail = data.email.trim().toLowerCase();

    const existingSuperuser = await this.usersRepository.findOne({
      where: {
        role: UserRole.SUPERUSER,
      },
    });

    if (existingSuperuser) {
      if (existingSuperuser.email === normalizedEmail) {
        return {
          user: existingSuperuser,
          created: false,
        };
      }

      throw new ConflictException(
        'Ya existe un superusuario configurado con otro correo electrónico.',
      );
    }

    const existingEmail = await this.usersRepository.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingEmail) {
      throw new ConflictException(
        'El correo configurado para el superusuario pertenece a una cuenta existente.',
      );
    }

    const now = new Date();

    const superuser = this.usersRepository.create({
      name: data.name.trim(),
      email: normalizedEmail,
      passwordHash: data.passwordHash,
      avatarUrl: null,
      role: UserRole.SUPERUSER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: now,
      approvedAt: now,
      approvedBy: null,
    });

    try {
      const savedSuperuser = await this.usersRepository.save(superuser);

      return {
        user: savedSuperuser,
        created: true,
      };
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code === '23505'
      ) {
        throw new ConflictException(
          'No se pudo crear el superusuario porque ya existe una cuenta incompatible.',
        );
      }

      throw error;
    }
  }
}
