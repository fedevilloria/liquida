import { ApiProperty } from '@nestjs/swagger';

import { User } from '../../users/entities/user.entity';
import { UserRole } from '../../users/enums/user-role.enum';
import { UserStatus } from '../../users/enums/user-status.enum';

/**
 * Representación pública de un usuario.
 *
 * Nunca contiene passwordHash.
 */
export class AuthUserResponseDto {
  @ApiProperty({
    example: 1,
  })
  id!: number;

  @ApiProperty({
    example: 'Federico Villoria',
  })
  name!: string;

  @ApiProperty({
    example: 'federico@ejemplo.com',
  })
  email!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.USER,
  })
  role!: UserRole;

  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.PENDING_EMAIL_VERIFICATION,
  })
  status!: UserStatus;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  avatarUrl!: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  static fromEntity(user: User): AuthUserResponseDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
    };
  }
}
