import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomBytes } from 'crypto';
import { DataSource, IsNull, MoreThan, Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';
import { UserStatus } from '../users/enums/user-status.enum';
import { UserSession } from './entities/user-session.entity';

export interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
}

export interface CreatedSession {
  refreshToken: string;
  expiresAt: Date;
  session: UserSession;
}

export interface RotatedSession extends CreatedSession {
  user: User;
}

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly sessionsRepository: Repository<UserSession>,

    private readonly configService: ConfigService,

    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea una nueva sesión renovable.
   */
  async createForUser(
    user: User,
    metadata: SessionMetadata,
  ): Promise<CreatedSession> {
    const sessionData = this.generateSessionData(user, metadata);

    const session = this.sessionsRepository.create(sessionData);

    const savedSession = await this.sessionsRepository.save(session);

    return {
      refreshToken: sessionData.refreshToken,
      expiresAt: sessionData.expiresAt,
      session: savedSession,
    };
  }

  /**
   * Consume un refresh token y lo reemplaza por uno nuevo.
   *
   * El anterior queda revocado para impedir su reutilización.
   */
  async rotate(
    refreshToken: string,
    metadata: SessionMetadata,
  ): Promise<RotatedSession> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    return this.dataSource.transaction(async (manager) => {
      const sessionsRepository = manager.getRepository(UserSession);

      const currentSession = await sessionsRepository
        .createQueryBuilder('session')
        .addSelect('session.refreshTokenHash')
        .innerJoinAndSelect('session.user', 'user')
        .where('session.refreshTokenHash = :refreshTokenHash', {
          refreshTokenHash,
        })
        .setLock('pessimistic_write')
        .getOne();

      if (
        !currentSession ||
        currentSession.revokedAt !== null ||
        currentSession.expiresAt.getTime() <= Date.now() ||
        currentSession.user.status !== UserStatus.ACTIVE
      ) {
        throw new UnauthorizedException('La sesión es inválida o ha vencido.');
      }

      currentSession.revokedAt = new Date();

      await sessionsRepository.save(currentSession);

      const sessionData = this.generateSessionData(
        currentSession.user,
        metadata,
      );

      const newSession = sessionsRepository.create(sessionData);

      const savedSession = await sessionsRepository.save(newSession);

      return {
        refreshToken: sessionData.refreshToken,
        expiresAt: sessionData.expiresAt,
        session: savedSession,
        user: currentSession.user,
      };
    });
  }

  /**
   * Revoca una sesión mediante su refresh token.
   *
   * No genera error si el token ya no existe o estaba revocado.
   */
  async revoke(refreshToken: string): Promise<void> {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    await this.sessionsRepository.update(
      {
        refreshTokenHash,
        revokedAt: IsNull(),
      },
      {
        revokedAt: new Date(),
      },
    );
  }

  /**
   * Calcula el hash SHA-256 del refresh token.
   */
  hashRefreshToken(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  /**
   * Genera los datos de una sesión sin persistirlos.
   */
  private generateSessionData(
    user: User,
    metadata: SessionMetadata,
  ): {
    refreshToken: string;
    refreshTokenHash: string;
    expiresAt: Date;
    revokedAt: null;
    userAgent: string | null;
    ipAddress: string | null;
    userId: number;
    user: User;
  } {
    const refreshToken = randomBytes(64).toString('base64url');

    const expirationDays = this.configService.getOrThrow<number>(
      'AUTH_REFRESH_EXPIRES_DAYS',
    );

    const expiresAt = new Date(
      Date.now() + expirationDays * 24 * 60 * 60 * 1000,
    );

    return {
      refreshToken,
      refreshTokenHash: this.hashRefreshToken(refreshToken),
      expiresAt,
      revokedAt: null,
      userAgent: metadata.userAgent?.slice(0, 500) ?? null,
      ipAddress: metadata.ipAddress?.slice(0, 45) ?? null,
      userId: user.id,
      user,
    };
  }

  /**
   * Obtiene una sesión vigente asociada al usuario indicado.
   *
   * Esta validación permite rechazar access tokens pertenecientes
   * a sesiones vencidas, revocadas o cerradas.
   */
  async findActiveSession(
    sessionId: number,
    userId: number,
  ): Promise<UserSession | null> {
    return this.sessionsRepository.findOne({
      where: {
        id: sessionId,
        userId,
        revokedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      relations: {
        user: true,
      },
    });
  }
}
