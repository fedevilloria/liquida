import { ApiProperty } from '@nestjs/swagger';

import { AuthUserResponseDto } from './auth-user-response.dto';

export class RegisterUserResponseDto {
  @ApiProperty({
    type: AuthUserResponseDto,
  })
  user!: AuthUserResponseDto;

  @ApiProperty({
    description: 'Indica si el correo de verificación pudo enviarse.',
    example: true,
  })
  verificationEmailSent!: boolean;

  @ApiProperty({
    example: 'La cuenta fue registrada. Revisá tu correo para verificarla.',
  })
  message!: string;
}
