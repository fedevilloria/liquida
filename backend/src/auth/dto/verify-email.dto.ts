import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Token recibido mediante el enlace de verificación.',
    example: 'a'.repeat(64),
    minLength: 64,
    maxLength: 64,
  })
  @IsString()
  @Length(64, 64, {
    message: 'El token de verificación debe contener 64 caracteres.',
  })
  @Matches(/^[a-f0-9]{64}$/, {
    message: 'El token de verificación no tiene un formato válido.',
  })
  token!: string;
}
