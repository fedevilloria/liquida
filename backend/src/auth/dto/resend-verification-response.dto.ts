import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationResponseDto {
  @ApiProperty({
    example:
      'Si existe una cuenta pendiente de verificación, enviaremos un nuevo correo.',
  })
  message!: string;
}
