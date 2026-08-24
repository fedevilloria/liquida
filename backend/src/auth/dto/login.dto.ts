import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
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

  @ApiProperty({
    example: 'Liquida2026',
    writeOnly: true,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  password!: string;
}
