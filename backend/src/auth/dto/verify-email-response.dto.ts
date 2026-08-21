import { ApiProperty } from '@nestjs/swagger';

import { UserStatus } from '../../users/enums/user-status.enum';

export class VerifyEmailResponseDto {
  @ApiProperty({
    example: 'El correo fue verificado correctamente.',
  })
  message!: string;

  @ApiProperty({
    enum: UserStatus,
    example: UserStatus.PENDING_APPROVAL,
  })
  status!: UserStatus;

  @ApiProperty({
    type: String,
    format: 'date-time',
  })
  emailVerifiedAt!: Date;
}
