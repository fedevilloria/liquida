import { ApiHideProperty } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../users/entities/user.entity';

/**
 * Token temporal utilizado para verificar un correo electrónico.
 *
 * La base de datos conserva únicamente el hash SHA-256.
 * El token original solo se envía al correo del usuario.
 */
@Entity('email_verification_tokens')
@Index('IDX_email_verification_tokens_user_id', ['userId'])
export class EmailVerificationToken extends BaseEntity {
  /**
   * Hash SHA-256 del token original.
   *
   * Se guarda como 64 caracteres hexadecimales y no se
   * selecciona en las consultas normales.
   */
  @ApiHideProperty()
  @Index('UQ_email_verification_tokens_token_hash', {
    unique: true,
  })
  @Column({
    type: 'varchar',
    length: 64,
    select: false,
  })
  tokenHash!: string;

  /**
   * Fecha y hora a partir de la cual el token deja de ser válido.
   */
  @Column({
    type: 'timestamp',
  })
  expiresAt!: Date;

  /**
   * Fecha en la que el token fue utilizado.
   *
   * Mientras sea null, todavía no fue consumido.
   */
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  usedAt!: Date | null;

  /**
   * Identificador del usuario propietario del token.
   *
   * Se conserva también como campo para poder realizar
   * consultas sin cargar toda la relación.
   */
  @Column({
    type: 'integer',
  })
  userId!: number;

  /**
   * Usuario cuyo correo debe verificarse.
   */
  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'userId',
  })
  user!: User;
}
