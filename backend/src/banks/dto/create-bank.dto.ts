import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * DTO utilizado para registrar un nuevo banco.
 *
 * Contiene únicamente los datos necesarios para crear
 * el banco y validar su porcentaje de comisión.
 */
export class CreateBankDto {
  /**
   * Nombre del banco o medio de cobro.
   *
   * Se eliminan los espacios innecesarios al comienzo
   * y al final antes de realizar las validaciones.
   */
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({
    message: 'El nombre del banco debe ser un texto.',
  })
  @IsNotEmpty({
    message: 'El nombre del banco es obligatorio.',
  })
  @MaxLength(100, {
    message: 'El nombre del banco no puede superar los 100 caracteres.',
  })
  name!: string;

  /**
   * Porcentaje de comisión cobrado por el banco.
   *
   * Type transforma valores numéricos recibidos como texto,
   * por ejemplo "0.8", en un número.
   */
  @Type(() => Number)
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message:
        'La comisión del banco debe ser un número con hasta 2 decimales.',
    },
  )
  @Min(0, {
    message: 'La comisión del banco no puede ser negativa.',
  })
  @Max(100, {
    message: 'La comisión del banco no puede superar el 100%.',
  })
  commissionPercentage!: number;
}