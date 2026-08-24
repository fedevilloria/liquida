import { ApiHideProperty } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Sesión renovable de un usuario.
 *
 * El access token JWT no se persiste. Solamente se conserva
 * el hash del refresh token para renovar o revocar la sesión.
 */
@Entity('user_sessions')
@Index('IDX_user_sessions_user_id', ['userId'])
export class UserSession extends BaseEntity {
  /**
   * Hash SHA-256 del refresh token.
   *
   * El token original solamente se entrega mediante
   * una cookie HttpOnly.
   */
  @ApiHideProperty()
  @Index('UQ_user_sessions_refresh_token_hash', {
    unique: true,
  })
  @Column({
    type: 'varchar',
    length: 64,
    select: false,
  })
  refreshTokenHash!: string;

  /**
   * Fecha de vencimiento de la sesión renovable.
   */
  @Column({
    type: 'timestamp',
  })
  expiresAt!: Date;

  /**
   * Fecha de revocación.
   *
   * Mientras sea null, la sesión continúa vigente.
   */
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  revokedAt!: Date | null;

  /**
   * Navegador o cliente que inició la sesión.
   */
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  userAgent!: string | null;

  /**
   * Dirección IP desde la que se inició la sesión.
   *
   * La longitud 45 admite IPv4 e IPv6.
   */
  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress!: string | null;

  @Column({
    type: 'integer',
  })
  userId!: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  user!: User;
}
