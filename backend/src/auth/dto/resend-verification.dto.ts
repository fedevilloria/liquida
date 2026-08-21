import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, MaxLength } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    example: 'usuario@ejemplo.com',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail(
    {},
    {
      message: 'El correo electrónico no tiene un formato válido.',
    },
  )
  @MaxLength(254)
  email!: string;
}
