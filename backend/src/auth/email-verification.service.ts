import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';

import { User } from '../users/entities/user.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';

import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';

import { UserStatus } from '../users/enums/user-status.enum';

/**
 * Resultado interno utilizado para construir el correo.
 *
 * plainToken es el único valor que podrá enviarse al usuario.
 * Nunca debe guardarse en la base de datos ni mostrarse en logs.
 */
export interface GeneratedEmailVerificationToken {
  plainToken: string;
  expiresAt: Date;
}

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerificationToken)
    private readonly tokensRepository: Repository<EmailVerificationToken>,

    private readonly configService: ConfigService,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Genera un nuevo token de verificación para el usuario.
   *
   * Los tokens anteriores que todavía no fueron utilizados
   * se eliminan para que solamente el más reciente sea válido.
   */
  async generateForUser(user: User): Promise<GeneratedEmailVerificationToken> {
    await this.tokensRepository.delete({
      userId: user.id,
      usedAt: IsNull(),
    });

    const plainToken = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(plainToken);

    const expirationHours = this.configService.getOrThrow<number>(
      'EMAIL_VERIFICATION_EXPIRES_HOURS',
    );

    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    const verificationToken = this.tokensRepository.create({
      tokenHash,
      expiresAt,
      usedAt: null,
      userId: user.id,
      user,
    });

    await this.tokensRepository.save(verificationToken);

    return {
      plainToken,
      expiresAt,
    };
  }

  /**
   * Calcula el hash SHA-256 representado mediante
   * 64 caracteres hexadecimales.
   */
  hashToken(plainToken: string): string {
    return createHash('sha256').update(plainToken).digest('hex');
  }

  /**
   * Verifica un token y actualiza el estado del usuario.
   * La transacción garantiza que el token se consuma
   * junto con la verificación de la cuenta.
   */
  async verifyToken(plainToken: string): Promise<User> {
    const tokenHash = this.hashToken(plainToken);

    return this.dataSource.transaction(async (manager) => {
      const tokensRepository = manager.getRepository(EmailVerificationToken);
      const usersRepository = manager.getRepository(User);

      const verificationToken = await tokensRepository
        .createQueryBuilder('token')
        .addSelect('token.tokenHash')
        .innerJoinAndSelect('token.user', 'user')
        .where('token.tokenHash = :tokenHash', {
          tokenHash,
        })
        .setLock('pessimistic_write')
        .getOne();

      if (!verificationToken) {
        throw new BadRequestException('El token de verificación es inválido.');
      }

      if (verificationToken.usedAt !== null) {
        throw new BadRequestException(
          'El token de verificación ya fue utilizado.',
        );
      }

      if (verificationToken.expiresAt.getTime() <= Date.now()) {
        throw new BadRequestException('El token de verificación ha vencido.');
      }

      const user = verificationToken.user;

      if (user.status !== UserStatus.PENDING_EMAIL_VERIFICATION) {
        throw new BadRequestException(
          'El correo de esta cuenta ya fue verificado.',
        );
      }

      const verificationDate = new Date();

      user.emailVerifiedAt = verificationDate;
      user.status = UserStatus.PENDING_APPROVAL;

      verificationToken.usedAt = verificationDate;

      await usersRepository.save(user);
      await tokensRepository.save(verificationToken);

      return user;
    });
  }

  /**
   * Indica si ya transcurrió el tiempo mínimo necesario
   * para generar otro correo de verificación.
   */
  async canResendForUser(userId: number): Promise<boolean> {
    const latestUnusedToken = await this.tokensRepository.findOne({
      where: {
        userId,
        usedAt: IsNull(),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!latestUnusedToken) {
      return true;
    }

    const cooldownSeconds = this.configService.getOrThrow<number>(
      'EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS',
    );

    const nextAllowedTime =
      latestUnusedToken.createdAt.getTime() + cooldownSeconds * 1000;

    return Date.now() >= nextAllowedTime;
  }
}
