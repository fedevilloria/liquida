import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BaseEntity } from '../../common/entities/base.entity';
import { UserRole } from '../enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';

@Entity('users')
export class User extends BaseEntity {
  /**
   * Nombre que se mostrará dentro de Liquida.
   */
  @ApiProperty({
    description: 'Nombre completo del usuario.',
    example: 'Federico Villoria',
    maxLength: 100,
  })
  @Column({
    type: 'varchar',
    length: 100,
  })
  name!: string;

  /**
   * Correo utilizado para registrarse e iniciar sesión.
   *
   * El servicio guardará siempre el valor normalizado
   * en minúsculas para evitar cuentas duplicadas.
   */
  @ApiProperty({
    description: 'Correo electrónico del usuario.',
    example: 'federico@ejemplo.com',
    maxLength: 254,
  })
  @Column({
    type: 'varchar',
    length: 254,
    unique: true,
  })
  email!: string;

  /**
   * Hash seguro de la contraseña.
   *
   * select: false impide que se devuelva accidentalmente
   * en las consultas normales de TypeORM.
   */
  @ApiHideProperty()
  @Column({
    type: 'varchar',
    length: 255,
    select: false,
  })
  passwordHash!: string;

  /**
   * Imagen de perfil opcional.
   */
  @ApiProperty({
    description: 'Dirección de la imagen de perfil.',
    example: 'https://ejemplo.com/avatar.png',
    nullable: true,
  })
  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  avatarUrl!: string | null;

  /**
   * Rol asignado por el backend.
   *
   * El registro público siempre asignará USER.
   */
  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  /**
   * Estado actual de la cuenta.
   */
  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.PENDING_EMAIL_VERIFICATION,
  })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_EMAIL_VERIFICATION,
  })
  status!: UserStatus;

  /**
   * Fecha de verificación del correo.
   */
  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  emailVerifiedAt!: Date | null;

  /**
   * Fecha en la que el acceso fue aprobado.
   */
  @ApiProperty({
    type: String,
    format: 'date-time',
    nullable: true,
  })
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  approvedAt!: Date | null;

  /**
   * Superusuario que aprobó la cuenta.
   *
   * Es una relación con la propia tabla users.
   */
  @ApiProperty({
    type: () => User,
    nullable: true,
  })
  @ManyToOne(() => User, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'approvedById',
  })
  approvedBy!: User | null;
}
