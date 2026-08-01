import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO utilizado para registrar un nuevo grupo.
 *
 * Define y valida únicamente los datos que el cliente
 * puede enviar durante la creación del registro.
 */
export class CreateGroupDto {
  /**
   * Nombre identificador del grupo.
   *
   * Transform elimina espacios innecesarios al comienzo
   * y al final antes de ejecutar las validaciones.
   */
  @ApiProperty({
    description: 'Nombre identificador del grupo.',
    example: 'Grupo Norte',
    maxLength: 100,
  })
  @Transform(({ value }: TransformFnParams): unknown =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'El nombre del grupo debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El nombre del grupo es obligatorio.',
  })
  @MaxLength(100, {
    message: 'El nombre del grupo no puede superar los 100 caracteres.',
  })
  name!: string;
}
